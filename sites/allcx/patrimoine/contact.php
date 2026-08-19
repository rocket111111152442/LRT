<?php
/**
 * Traitement du formulaire de contact — ALLCX.
 *
 * À utiliser si l'hébergement autorise l'exécution de PHP (offres IONOS Web Hosting).
 * Renseigner $destinataire ci-dessous, puis vérifier que le formulaire pointe bien
 * sur ce fichier (attribut action="contact.php").
 *
 * Si PHP n'est pas disponible, le formulaire bascule automatiquement sur l'ouverture
 * du logiciel de messagerie du visiteur (comportement géré par assets/js/allcx.js).
 */

declare(strict_types=1);

$destinataire = 'patrimoine@allcx-consulting.com';   // ex. contact@allcx-consulting.com
$expediteurTechnique = 'no-reply@allcx-consulting.com';
$pageRetour = 'contact.html';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $pageRetour, true, 303);
    exit;
}

/** Piège à robots : champ masqué qui doit rester vide. */
if (!empty($_POST['societe_web'] ?? '')) {
    header('Location: ' . $pageRetour . '?envoi=ok', true, 303);
    exit;
}

function champ(string $cle, int $max = 500): string
{
    $valeur = trim((string) ($_POST[$cle] ?? ''));
    $valeur = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $valeur);
    return mb_substr(strip_tags($valeur), 0, $max);
}

$nom       = champ('nom', 120);
$societe   = champ('societe', 160);
$email     = champ('email', 180);
$telephone = champ('telephone', 40);
$sujet     = champ('sujet', 160);
$message   = mb_substr(strip_tags(trim((string) ($_POST['message'] ?? ''))), 0, 5000);

$erreurs = [];
if ($nom === '') {
    $erreurs[] = 'nom';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erreurs[] = 'email';
}
if (mb_strlen($message) < 20) {
    $erreurs[] = 'message';
}
if (empty($_POST['consentement'] ?? '')) {
    $erreurs[] = 'consentement';
}

if ($erreurs !== []) {
    header('Location: ' . $pageRetour . '?envoi=erreur', true, 303);
    exit;
}

$corps = "Nouvelle demande depuis le site\n\n"
    . "Nom       : {$nom}\n"
    . "Société   : {$societe}\n"
    . "E-mail    : {$email}\n"
    . "Téléphone : {$telephone}\n"
    . "Objet     : {$sujet}\n\n"
    . "Message :\n{$message}\n\n"
    . '-- ' . "\n"
    . 'Reçu le ' . date('d/m/Y à H:i') . ' — ' . ($_SERVER['HTTP_HOST'] ?? '') . "\n";

$entetes = [
    'From: ALLCX <' . $expediteurTechnique . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$objet = '[Site ALLCX] ' . ($sujet !== '' ? $sujet : 'Demande de contact');
$envoye = @mail($destinataire, '=?UTF-8?B?' . base64_encode($objet) . '?=', $corps, implode("\r\n", $entetes));

header('Location: ' . $pageRetour . ($envoye ? '?envoi=ok' : '?envoi=erreur'), true, 303);
exit;
