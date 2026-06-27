import { randomUUID } from "crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import {
  Firestore,
  getFirestore,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { resolvePostgresConnectionString } from "@/lib/databaseUrl";

type Dict = Record<string, unknown>;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  firestore?: Firestore;
};

export function shouldUseFirebase() {
  return (
    process.env.DATABASE_PROVIDER === "firebase" ||
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) ||
    Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL)
  );
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaPg({
    connectionString: resolvePostgresConnectionString(connectionString),
  });

  return new PrismaClient({
    adapter,
  });
}

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function getFirebaseCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as Dict;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase is not configured.");
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function getFirebaseDb() {
  if (globalForPrisma.firestore) {
    return globalForPrisma.firestore;
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(getFirebaseCredential()),
    });
  }

  globalForPrisma.firestore = getFirestore();
  return globalForPrisma.firestore;
}

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

function collection(name: string) {
  return getFirebaseDb().collection(name);
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Dict).map(([key, nestedValue]) => [
        key,
        normalizeValue(nestedValue),
      ]),
    );
  }

  return value;
}

function normalizeDoc(id: string, data: Dict | undefined) {
  if (!data) {
    return null;
  }

  return normalizeValue({ id, ...data }) as Dict;
}

function removeUndefinedValues(value: unknown): unknown {
  // Les dates (et timestamps Firestore) doivent rester intactes : sans ce
  // garde-fou, elles seraient parcourues comme des objets et transformees en
  // objet vide {}, ce qui corrompt soldAt, spentAt, createdAt, etc.
  if (value instanceof Date || value instanceof Timestamp) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(removeUndefinedValues);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Dict)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, removeUndefinedValues(nestedValue)]),
    );
  }

  return value;
}

function firestoreData<T extends Dict>(data: T): T {
  return removeUndefinedValues(data) as T;
}

function applySelect<T extends Dict | null>(record: T, select?: Dict): T {
  if (!record || !select) {
    return record;
  }

  const selected: Dict = {};

  for (const [key, value] of Object.entries(select)) {
    if (value === true) {
      selected[key] = record[key];
    } else if (
      typeof value === "object" &&
      value !== null &&
      "select" in value &&
      typeof record[key] === "object"
    ) {
      selected[key] = applySelect(record[key] as Dict, (value as Dict).select as Dict);
    }
  }

  return selected as T;
}

async function findByField(collectionName: string, field: string, value: unknown) {
  const snapshot = await collection(collectionName).where(field, "==", value).limit(1).get();
  const doc = snapshot.docs[0];
  return doc ? normalizeDoc(doc.id, doc.data()) : null;
}

async function findById(collectionName: string, id: string) {
  const snapshot = await collection(collectionName).doc(id).get();
  return snapshot.exists ? normalizeDoc(snapshot.id, snapshot.data()) : null;
}

async function findProAccount(where: Dict) {
  if (typeof where.id === "string") {
    return findById("proAccounts", where.id);
  }

  if (typeof where.slug === "string") {
    return findByField("proAccounts", "slug", where.slug);
  }

  if (typeof where.ownerEmail === "string") {
    return findByField("proAccounts", "ownerEmail", where.ownerEmail);
  }

  return null;
}

async function findUser(where: Dict) {
  if (typeof where.id === "string") {
    return findById("users", where.id);
  }

  if (typeof where.email === "string") {
    return findByField("users", "email", where.email);
  }

  return null;
}

async function findPendingProSignup(where: Dict) {
  if (typeof where.id === "string") {
    return findById("pendingProSignups", where.id);
  }

  if (typeof where.stripeSessionId === "string") {
    return findByField(
      "pendingProSignups",
      "stripeSessionId",
      where.stripeSessionId,
    );
  }

  return null;
}

async function findInventoryItem(where: Dict) {
  if (typeof where.id === "string") {
    return findById("inventoryItems", where.id);
  }

  return null;
}

async function findSetupAppointment(where: Dict) {
  if (typeof where.id === "string") {
    return findById("setupAppointments", where.id);
  }

  if (typeof where.stripeSessionId === "string") {
    return findByField(
      "setupAppointments",
      "stripeSessionId",
      where.stripeSessionId,
    );
  }

  return null;
}

function compareDate(value: unknown, condition: Dict) {
  const date = value instanceof Date ? value : new Date(String(value ?? ""));

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (condition.gte && date < new Date(String(condition.gte))) {
    return false;
  }

  if (condition.gt && date <= new Date(String(condition.gt))) {
    return false;
  }

  if (condition.lte && date > new Date(String(condition.lte))) {
    return false;
  }

  if (condition.lt && date >= new Date(String(condition.lt))) {
    return false;
  }

  return true;
}

function matchesWhereValue(recordValue: unknown, condition: unknown) {
  if (typeof condition !== "object" || condition === null || Array.isArray(condition)) {
    return recordValue === condition;
  }

  const conditionDict = condition as Dict;

  if ("notIn" in conditionDict && Array.isArray(conditionDict.notIn)) {
    return !conditionDict.notIn.includes(recordValue);
  }

  if ("in" in conditionDict && Array.isArray(conditionDict.in)) {
    return conditionDict.in.includes(recordValue);
  }

  if (
    "gte" in conditionDict ||
    "gt" in conditionDict ||
    "lte" in conditionDict ||
    "lt" in conditionDict
  ) {
    return compareDate(recordValue, conditionDict);
  }

  return true;
}

function matchesWhereObject(record: Dict, where: Dict | undefined) {
  if (!where) {
    return true;
  }

  return Object.entries(where).every(([field, condition]) =>
    matchesWhereValue(record[field], condition),
  );
}

function compareRecordsByOrder(left: Dict, right: Dict, orderBy: Dict | Dict[] | undefined) {
  const order = Array.isArray(orderBy) ? orderBy[0] : orderBy;

  if (!order) {
    return 0;
  }

  const [field, direction] = Object.entries(order)[0] ?? [];

  if (!field) {
    return 0;
  }

  const leftValue = left[field];
  const rightValue = right[field];
  const leftComparable = leftValue instanceof Date ? leftValue.getTime() : leftValue;
  const rightComparable = rightValue instanceof Date ? rightValue.getTime() : rightValue;
  const result = String(leftComparable ?? "").localeCompare(String(rightComparable ?? ""));

  return direction === "desc" ? -result : result;
}

function createGenericFirestoreModel(
  collectionName: string,
  defaults: Dict = {},
  findUniqueFields: string[] = ["id"],
) {
  const model = {
    async findMany(args: { where?: Dict; orderBy?: Dict | Dict[]; take?: number; select?: Dict } = {}) {
      const snapshot = await collection(collectionName).get();
      const records = snapshot.docs
        .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
        .filter((record) => matchesWhereObject(record, args.where))
        .sort((left, right) => compareRecordsByOrder(left, right, args.orderBy));

      return records
        .slice(0, args.take ?? records.length)
        .map((record) => applySelect(record, args.select));
    },
    async findFirst(args: { where?: Dict; orderBy?: Dict | Dict[]; select?: Dict } = {}) {
      const records = await model.findMany({ ...args, take: 1 });
      return records[0] ?? null;
    },
    async findUnique(args: { where: Dict; select?: Dict }) {
      for (const field of findUniqueFields) {
        if (typeof args.where[field] === "string") {
          const record =
            field === "id"
              ? await findById(collectionName, String(args.where[field]))
              : await findByField(collectionName, field, args.where[field]);

          return applySelect(record, args.select);
        }
      }

      return null;
    },
    async create(args: { data: Dict; select?: Dict }) {
      const id = typeof args.data.id === "string" ? args.data.id : randomUUID();
      const timestamp = now();
      const record = {
        ...defaults,
        ...args.data,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await collection(collectionName).doc(id).set(firestoreData(record));
      return applySelect(record, args.select);
    },
    async update(args: { where: Dict; data: Dict; select?: Dict }) {
      const existing = await model.findUnique({ where: args.where });

      if (!existing) {
        throw new Error(`${collectionName} record not found.`);
      }

      await collection(collectionName).doc(String((existing as Dict).id)).set(
        firestoreData({
          ...args.data,
          updatedAt: now(),
        }),
        { merge: true },
      );

      return applySelect(
        await findById(collectionName, String((existing as Dict).id)),
        args.select,
      );
    },
    async updateMany(args: { where?: Dict; data: Dict }) {
      const snapshot = await collection(collectionName).get();
      const records = snapshot.docs
        .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
        .filter((record) => matchesWhereObject(record, args.where));

      for (const record of records) {
        await collection(collectionName).doc(String(record.id)).set(
          firestoreData({ ...args.data, updatedAt: now() }),
          { merge: true },
        );
      }

      return { count: records.length };
    },
    async upsert(args: { where: Dict; update: Dict; create: Dict; select?: Dict }) {
      const existing = await model.findUnique({ where: args.where });

      if (existing) {
        return model.update({ where: { id: (existing as Dict).id }, data: args.update, select: args.select });
      }

      return model.create({ data: args.create, select: args.select });
    },
    async delete(args: { where: Dict }) {
      const existing = await model.findUnique({ where: args.where });

      if (!existing) {
        throw new Error(`${collectionName} record not found.`);
      }

      await collection(collectionName).doc(String((existing as Dict).id)).delete();
      return existing;
    },
  };

  return model;
}

function now() {
  return new Date();
}

function matchesSearch(record: Dict, search: string) {
  const needle = search.toLowerCase();
  const fields = [
    "ticketNumber",
    "firstName",
    "lastName",
    "phone",
    "email",
    "brand",
    "model",
  ];

  return fields.some((field) =>
    String(record[field] ?? "")
      .toLowerCase()
      .includes(needle),
  );
}

function extractSearch(where: Dict | undefined) {
  const firstOr = Array.isArray(where?.OR) ? (where?.OR as Dict[])[0] : null;
  const contains = firstOr?.firstName;

  if (typeof contains === "object" && contains !== null && "contains" in contains) {
    const value = (contains as Dict).contains;
    return typeof value === "string" ? value : "";
  }

  return "";
}

function createFirestorePrisma() {
  return {
    user: {
      async findUnique(args: { where: Dict; select?: Dict }) {
        const user = await findUser(args.where);

        if (!user) {
          return null;
        }

        if (args.select?.proAccount && user.proAccountId) {
          user.proAccount = await findProAccount({ id: user.proAccountId });
        }

        return applySelect(user, args.select);
      },
      async findFirst(args: { where?: Dict; orderBy?: Dict | Dict[]; select?: Dict } = {}) {
        const where = args.where ?? {};

        // Recherche par proAccountId (+ role éventuel) : on interroge la
        // collection users.
        if (typeof where.proAccountId === "string") {
          const snapshot = await collection("users")
            .where("proAccountId", "==", where.proAccountId)
            .get();
          const users = snapshot.docs
            .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
            .filter((u) => !where.role || u.role === where.role)
            .sort(
              (left, right) =>
                Number((left.createdAt as Date | undefined)?.getTime?.() ?? 0) -
                Number((right.createdAt as Date | undefined)?.getTime?.() ?? 0),
            );
          return applySelect(users[0] ?? null, args.select);
        }

        return applySelect(await findUser(where), args.select);
      },
      async findMany(args: { where?: Dict; select?: Dict } = {}) {
        const where = args.where ?? {};
        if (typeof where.proAccountId === "string") {
          const snapshot = await collection("users")
            .where("proAccountId", "==", where.proAccountId)
            .get();
          return snapshot.docs
            .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
            .filter((u) => !where.role || u.role === where.role)
            .map((u) => applySelect(u, args.select));
        }
        return [];
      },
      async upsert(args: { where: Dict; update: Dict; create: Dict }) {
        const existing = await findUser(args.where);
        const timestamp = now();

        if (existing) {
          await collection("users").doc(String(existing.id)).set(
            firestoreData({
              ...args.update,
              updatedAt: timestamp,
            }),
            { merge: true },
          );
          return findById("users", String(existing.id));
        }

        const id = randomUUID();
        const user = {
          ...args.create,
          id,
          role: args.create.role ?? "ADMIN",
          createdAt: timestamp,
        };

        await collection("users").doc(id).set(firestoreData(user));
        return user;
      },
      async update(args: { where: Dict; data: Dict; select?: Dict }) {
        const user = await findUser(args.where);

        if (!user) {
          throw new Error("User not found.");
        }

        await collection("users")
          .doc(String(user.id))
          .set(firestoreData(args.data), { merge: true });

        return applySelect(await findById("users", String(user.id)), args.select);
      },
    },

    proAccount: {
      async findUnique(args: { where: Dict; select?: Dict }) {
        return applySelect(await findProAccount(args.where), args.select);
      },
      async findMany(args: { where?: Dict; select?: Dict; orderBy?: Dict }) {
        const snapshot = await collection("proAccounts").get();
        const where = args.where ?? {};
        const accounts = snapshot.docs
          .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
          .filter((account) => {
            if (
              typeof where.paymentStatus === "string" &&
              account.paymentStatus !== where.paymentStatus
            ) {
              return false;
            }

            return true;
          })
          .sort((left, right) =>
            String(left.companyName ?? "").localeCompare(
              String(right.companyName ?? ""),
            ),
          );

        return accounts.map((account) => applySelect(account, args.select));
      },
      async create(args: { data: Dict }) {
        const id = randomUUID();
        const timestamp = now();
        const data = { ...args.data };
        const nestedUser = (data.users as Dict | undefined)?.create as Dict | undefined;
        delete data.users;

        const proAccount = {
          ...data,
          id,
          supportIncluded: data.supportIncluded ?? false,
          publicListed: data.publicListed ?? true,
          enterprisePlanDetails: data.enterprisePlanDetails ?? null,
          plan: data.plan ?? "basic",
          storageAddonGb: data.storageAddonGb ?? 0,
          stripeAccountId: data.stripeAccountId ?? null,
          stripeOnboarded: data.stripeOnboarded ?? false,
          paymentStatus: data.paymentStatus ?? "PENDING",
          shopCapacityPerDay: data.shopCapacityPerDay ?? 8,
          shopSlotDurationMinutes: data.shopSlotDurationMinutes ?? 60,
          shopMaxAppointmentsPerSlot: data.shopMaxAppointmentsPerSlot ?? 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        await collection("proAccounts").doc(id).set(firestoreData(proAccount));

        if (nestedUser) {
          const userId = randomUUID();
          await collection("users")
            .doc(userId)
            .set(
              firestoreData({
                ...nestedUser,
                id: userId,
                proAccountId: id,
                role: nestedUser.role ?? "ADMIN",
                createdAt: timestamp,
              }),
            );
        }

        return proAccount;
      },
      async update(args: { where: Dict; data: Dict }) {
        const account = await findProAccount(args.where);

        if (!account) {
          throw new Error("Pro account not found.");
        }

        await collection("proAccounts").doc(String(account.id)).set(
          firestoreData({
            ...args.data,
            updatedAt: now(),
          }),
          { merge: true },
        );

        return findById("proAccounts", String(account.id));
      },
      async delete(args: { where: Dict }) {
        const account = await findProAccount(args.where);

        if (!account) {
          throw new Error("Pro account not found.");
        }

        const usersSnapshot = await collection("users")
          .where("proAccountId", "==", String(account.id))
          .get();
        const appointmentsSnapshot = await collection("setupAppointments")
          .where("proAccountId", "==", String(account.id))
          .get();
        await Promise.all(usersSnapshot.docs.map((doc) => doc.ref.delete()));
        await Promise.all(
          appointmentsSnapshot.docs.map((doc) => doc.ref.delete()),
        );
        await collection("proAccounts").doc(String(account.id)).delete();

        return account;
      },
    },

    pendingProSignup: {
      async findUnique(args: { where: Dict; select?: Dict }) {
        return applySelect(await findPendingProSignup(args.where), args.select);
      },
      async create(args: { data: Dict; select?: Dict }) {
        const id = typeof args.data.id === "string" ? args.data.id : randomUUID();
        const timestamp = now();
        const pendingSignup = {
          ...args.data,
          id,
          shopCapacityPerDay: args.data.shopCapacityPerDay ?? 8,
          shopSlotDurationMinutes: args.data.shopSlotDurationMinutes ?? 60,
          shopMaxAppointmentsPerSlot: args.data.shopMaxAppointmentsPerSlot ?? 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        await collection("pendingProSignups")
          .doc(id)
          .set(firestoreData(pendingSignup));
        return applySelect(pendingSignup, args.select);
      },
      async update(args: { where: Dict; data: Dict; select?: Dict }) {
        const pendingSignup = await findPendingProSignup(args.where);

        if (!pendingSignup) {
          throw new Error("Pending pro signup not found.");
        }

        await collection("pendingProSignups").doc(String(pendingSignup.id)).set(
          firestoreData({
            ...args.data,
            updatedAt: now(),
          }),
          { merge: true },
        );

        return applySelect(
          await findById("pendingProSignups", String(pendingSignup.id)),
          args.select,
        );
      },
      async delete(args: { where: Dict }) {
        const pendingSignup = await findPendingProSignup(args.where);

        if (!pendingSignup) {
          throw new Error("Pending pro signup not found.");
        }

        await collection("pendingProSignups")
          .doc(String(pendingSignup.id))
          .delete();
        return pendingSignup;
      },
    },

    repair: {
      async findMany(args: { where?: Dict; orderBy?: Dict; select?: Dict }) {
        let query: Query = collection("repairs");
        const where = args.where ?? {};

        if (typeof where.proAccountId === "string") {
          query = query.where("proAccountId", "==", where.proAccountId);
        }

        if (typeof where.status === "string") {
          query = query.where("status", "==", where.status);
        }

        const snapshot = await query.get();
        const search = extractSearch(where);
        const repairs = snapshot.docs
          .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
          .filter((repair) => !search || matchesSearch(repair, search))
          .sort(
            (left, right) =>
              Number((right.createdAt as Date | undefined)?.getTime?.() ?? 0) -
              Number((left.createdAt as Date | undefined)?.getTime?.() ?? 0),
          );

        return repairs.map((repair) => applySelect(repair, args.select));
      },
      async findUnique(args: { where: Dict; select?: Dict }) {
        if (typeof args.where.id === "string") {
          return applySelect(await findById("repairs", args.where.id), args.select);
        }

        if (typeof args.where.ticketNumber === "string") {
          return applySelect(
            await findByField("repairs", "ticketNumber", args.where.ticketNumber),
            args.select,
          );
        }

        if (typeof args.where.quoteToken === "string") {
          return applySelect(
            await findByField("repairs", "quoteToken", args.where.quoteToken),
            args.select,
          );
        }

        if (typeof args.where.reviewToken === "string") {
          return applySelect(
            await findByField("repairs", "reviewToken", args.where.reviewToken),
            args.select,
          );
        }

        return null;
      },
      async create(args: { data: Dict; select?: Dict }) {
        const id = randomUUID();
        const timestamp = now();
        const repair = {
          ...args.data,
          id,
          status: args.data.status ?? "PAS_ENCORE_EN_REPARATION",
          readyEmailSent: args.data.readyEmailSent ?? false,
          reviewEmailSent: args.data.reviewEmailSent ?? false,
          reviewToken: args.data.reviewToken ?? null,
          reviewRespondedAt: args.data.reviewRespondedAt ?? null,
          quoteStatus: args.data.quoteStatus ?? "NONE",
          photos: args.data.photos ?? [],
          partsStatus: args.data.partsStatus ?? "NONE",
          partsCostCents: args.data.partsCostCents ?? null,
          archivedAt: args.data.archivedAt ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        await collection("repairs").doc(id).set(firestoreData(repair));
        return applySelect(repair, args.select);
      },
      async update(args: { where: Dict; data: Dict; select?: Dict }) {
        if (typeof args.where.id !== "string") {
          throw new Error("Repair id missing.");
        }

        await collection("repairs").doc(args.where.id).set(
          firestoreData({
            ...args.data,
            updatedAt: now(),
          }),
          { merge: true },
        );

        return applySelect(await findById("repairs", args.where.id), args.select);
      },
      async delete(args: { where: Dict }) {
        if (typeof args.where.id !== "string") {
          throw new Error("Repair id missing.");
        }

        const existing = await findById("repairs", args.where.id);
        await collection("repairs").doc(args.where.id).delete();
        return existing;
      },
    },

    repairEvent: {
      async findMany(args: { where?: Dict; orderBy?: Dict; select?: Dict }) {
        let query: Query = collection("repairEvents");
        const where = args.where ?? {};

        if (typeof where.repairId === "string") {
          query = query.where("repairId", "==", where.repairId);
        }

        if (typeof where.proAccountId === "string") {
          query = query.where("proAccountId", "==", where.proAccountId);
        }

        const snapshot = await query.get();
        const events = snapshot.docs
          .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
          .sort(
            (left, right) =>
              Number((right.createdAt as Date | undefined)?.getTime?.() ?? 0) -
              Number((left.createdAt as Date | undefined)?.getTime?.() ?? 0),
          );

        return events.map((event) => applySelect(event, args.select));
      },
      async create(args: { data: Dict; select?: Dict }) {
        const id = randomUUID();
        const event = {
          ...args.data,
          id,
          createdAt: now(),
        };

        await collection("repairEvents").doc(id).set(firestoreData(event));
        return applySelect(event, args.select);
      },
    },

    inventoryItem: {
      async findMany(args: { where?: Dict; orderBy?: Dict; select?: Dict }) {
        let query: Query = collection("inventoryItems");
        const where = args.where ?? {};

        if (typeof where.proAccountId === "string") {
          query = query.where("proAccountId", "==", where.proAccountId);
        }

        const snapshot = await query.get();
        const items = snapshot.docs
          .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
          .sort((left, right) =>
            String(left.name ?? "").localeCompare(String(right.name ?? "")),
          );

        return items.map((item) => applySelect(item, args.select));
      },
      async findUnique(args: { where: Dict; select?: Dict }) {
        return applySelect(await findInventoryItem(args.where), args.select);
      },
      async create(args: { data: Dict; select?: Dict }) {
        const id = randomUUID();
        const timestamp = now();
        const item = {
          ...args.data,
          id,
          category: args.data.category ?? "PIECE",
          reference: args.data.reference ?? null,
          quantity: args.data.quantity ?? 0,
          lowStockThreshold: args.data.lowStockThreshold ?? 1,
          unitCostCents: args.data.unitCostCents ?? 0,
          unitPriceCents: args.data.unitPriceCents ?? 0,
          supplier: args.data.supplier ?? null,
          location: args.data.location ?? null,
          notes: args.data.notes ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        await collection("inventoryItems").doc(id).set(firestoreData(item));
        return applySelect(item, args.select);
      },
      async update(args: { where: Dict; data: Dict; select?: Dict }) {
        const item = await findInventoryItem(args.where);

        if (!item) {
          throw new Error("Inventory item not found.");
        }

        await collection("inventoryItems").doc(String(item.id)).set(
          firestoreData({
            ...args.data,
            updatedAt: now(),
          }),
          { merge: true },
        );

        return applySelect(
          await findById("inventoryItems", String(item.id)),
          args.select,
        );
      },
      async delete(args: { where: Dict }) {
        const item = await findInventoryItem(args.where);

        if (!item) {
          throw new Error("Inventory item not found.");
        }

        await collection("inventoryItems").doc(String(item.id)).delete();
        return item;
      },
    },

    emailSettings: {
      async findUnique(args: { where: Dict }) {
        if (typeof args.where.id !== "string") {
          return null;
        }

        return findById("emailSettings", args.where.id);
      },
      async upsert(args: { where: Dict; update: Dict; create: Dict }) {
        const id = typeof args.where.id === "string" ? args.where.id : "default";
        const existing = await findById("emailSettings", id);
        const timestamp = now();
        const defaults = {
          id,
          smtpEmail: null,
          smtpHost: "smtp.gmail.com",
          smtpPort: 465,
          smtpSecure: true,
          smtpFromName: null,
          smtpAppPassword: null,
          shopName: null,
          shopAddress: null,
          shopOpeningHours: null,
          shopPhone: null,
          googleReviewUrl: null,
        };
        const data = existing
          ? { ...args.update, updatedAt: timestamp }
          : { ...defaults, ...args.create, id, createdAt: timestamp, updatedAt: timestamp };

        await collection("emailSettings")
          .doc(id)
          .set(firestoreData(data), { merge: true });
        return findById("emailSettings", id);
      },
    },

    emailVerificationCode: {
      async findUnique(args: { where: Dict; select?: Dict }) {
        if (typeof args.where.id !== "string") {
          return null;
        }

        return applySelect(
          await findById("emailVerificationCodes", args.where.id),
          args.select,
        );
      },
      async upsert(args: { where: Dict; update: Dict; create: Dict }) {
        const id = typeof args.where.id === "string" ? args.where.id : randomUUID();
        const existing = await findById("emailVerificationCodes", id);
        const timestamp = now();
        const data = existing
          ? { ...args.update, updatedAt: timestamp }
          : { ...args.create, id, createdAt: timestamp, updatedAt: timestamp };

        await collection("emailVerificationCodes")
          .doc(id)
          .set(firestoreData(data), {
            merge: true,
          });
        return findById("emailVerificationCodes", id);
      },
      async delete(args: { where: Dict }) {
        if (typeof args.where.id !== "string") {
          throw new Error("Email verification code id missing.");
        }

        const existing = await findById("emailVerificationCodes", args.where.id);
        await collection("emailVerificationCodes").doc(args.where.id).delete();
        return existing;
      },
    },

    setupAppointment: {
      async findUnique(args: { where: Dict; select?: Dict }) {
        return applySelect(await findSetupAppointment(args.where), args.select);
      },
      async create(args: { data: Dict; select?: Dict }) {
        const id = randomUUID();
        const appointment = {
          ...args.data,
          id,
          createdAt: now(),
        };

        await collection("setupAppointments")
          .doc(id)
          .set(firestoreData(appointment));
        return applySelect(appointment, args.select);
      },
    },

    publicReview: {
      async findMany(args: { where?: Dict; orderBy?: Dict; take?: number; select?: Dict }) {
        const snapshot = await collection("publicReviews").get();
        const reviews = snapshot.docs
          .map((doc) => normalizeDoc(doc.id, doc.data()) as Dict)
          .sort(
            (left, right) =>
              Number((right.createdAt as Date | undefined)?.getTime?.() ?? 0) -
              Number((left.createdAt as Date | undefined)?.getTime?.() ?? 0),
          )
          .slice(0, args.take ?? 50);

        return reviews.map((review) => applySelect(review, args.select));
      },
      async create(args: { data: Dict; select?: Dict }) {
        const id = randomUUID();
        const review = {
          ...args.data,
          id,
          createdAt: now(),
        };

        await collection("publicReviews").doc(id).set(firestoreData(review));
        return applySelect(review, args.select);
      },
    },

    supportMessage: createGenericFirestoreModel("supportMessages", {
      status: "OPEN",
      moderatorNote: null,
      offre: null,
      proAccountId: null,
      category: null,
      priority: "NORMAL",
      ticketRef: null,
      replyText: null,
      repliedAt: null,
    }),

    controlRequest: createGenericFirestoreModel("controlRequests", {
      status: "PENDING",
      reason: null,
      respondedAt: null,
      endedAt: null,
    }),

    accountingSettings: createGenericFirestoreModel(
      "accountingSettings",
      {
        country: "FR",
        currency: "EUR",
        vatEnabled: true,
        defaultVatRateBps: 2000,
        incomeTaxRateBps: 1500,
        socialContributionRateBps: 2200,
        employerContributionRateBps: 4200,
        fiscalYearStartMonth: 1,
        notes: null,
      },
      ["id", "proAccountId"],
    ),

    accountingSale: createGenericFirestoreModel("accountingSales", {
      category: "AUTRE",
      quantity: 1,
      unitCostCents: 0,
      vatRateBps: 2000,
    }),

    accountingExpense: createGenericFirestoreModel("accountingExpenses", {
      category: "AUTRE",
      deductibleVatCents: 0,
    }),

    accountingEmployee: createGenericFirestoreModel("accountingEmployees", {
      grossMonthlySalaryCents: 0,
      employerContributionRateBps: null,
      active: true,
    }),

    accountingPayrollEntry: createGenericFirestoreModel("accountingPayrollEntries"),

    async $disconnect() {
      return undefined;
    },
  };
}

function getClient() {
  if (shouldUseFirebase()) {
    return createFirestorePrisma();
  }

  return getPrismaClient();
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getClient();
    const value = Reflect.get(client, property, receiver);

    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
