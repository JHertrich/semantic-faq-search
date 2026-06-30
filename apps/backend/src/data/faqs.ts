export interface Faq {
  id: string;
  questions: string[];
  answer: string;
}

export const faqs: Faq[] = [
  {
    id: 'faq-001',
    questions: [
      'Wie kann ich mein Passwort zurücksetzen?',
      'Ich habe mein Passwort vergessen – was tun?',
      'Passwort ändern',
    ],
    answer:
      '<p>Um dein Passwort zurückzusetzen, klicke auf der Anmeldeseite auf <strong>„Passwort vergessen"</strong>. Du erhältst eine E-Mail mit einem sicheren Link, über den du ein neues Passwort festlegen kannst.</p>' +
      '<ul><li>Der Link ist <strong>24 Stunden</strong> gültig.</li><li>Er kann nur <strong>einmal</strong> verwendet werden.</li></ul>',
  },
  {
    id: 'faq-002',
    questions: [
      'Welche Zahlungsmethoden werden akzeptiert?',
      'Wie kann ich bezahlen?',
      'Gibt es die Möglichkeit per Rechnung zu zahlen?',
    ],
    answer:
      '<p>Wir akzeptieren folgende Zahlungsmethoden:</p>' +
      '<ul><li>Kreditkarten (Visa, Mastercard, American Express)</li><li>SEPA-Lastschrift</li><li>PayPal</li><li>Rechnung (nur bei Jahresabonnements)</li></ul>' +
      '<p>Alle Zahlungen werden über verschlüsselte, PCI-DSS-konforme Verbindungen abgewickelt.</p>',
  },
  {
    id: 'faq-003',
    questions: [
      'Wie aktiviere ich die Zwei-Faktor-Authentifizierung (2FA)?',
      'Wie schütze ich mein Konto mit 2FA?',
      'Authenticator-App einrichten',
    ],
    answer:
      '<p>Die Zwei-Faktor-Authentifizierung aktivierst du unter <strong>Kontoeinstellungen → Sicherheit</strong>.</p>' +
      '<p>Unterstützte Authenticator-Apps:</p>' +
      '<ul><li>Google Authenticator</li><li>Authy</li></ul>' +
      '<p>Nach der Aktivierung wird bei jeder Anmeldung ein einmaliger Code verlangt.</p>',
  },
  {
    id: 'faq-004',
    questions: [
      'Wie erstelle ich einen API-Schlüssel?',
      'Wo finde ich meine API-Credentials?',
      'API-Token generieren',
    ],
    answer:
      '<p>API-Schlüssel erstellst du unter <strong>Entwicklereinstellungen → API &amp; Integrationen</strong>.</p>' +
      '<ul><li>Du kannst Schlüsseln Namen und Berechtigungen (Lesen/Schreiben) zuweisen.</li><li>Ein Ablaufdatum ist optional konfigurierbar.</li></ul>' +
      '<p>Behandle API-Schlüssel wie Passwörter – teile sie niemals öffentlich.</p>',
  },
  {
    id: 'faq-005',
    questions: [
      'Wie exportiere ich meine Daten?',
      'Kann ich meine Daten herunterladen?',
      'Datenexport anfordern',
    ],
    answer:
      '<p>Einen vollständigen Datenexport kannst du unter <strong>Einstellungen → Datenschutz → „Meine Daten exportieren"</strong> anfordern.</p>' +
      '<ul><li>Der Export wird als ZIP-Archiv im JSON-Format bereitgestellt.</li><li>Er wird an deine hinterlegte E-Mail-Adresse gesendet.</li><li>Die Vorbereitung kann bis zu <strong>24 Stunden</strong> dauern.</li></ul>',
  },
  {
    id: 'faq-006',
    questions: [
      'Wie lade ich Teammitglieder ein?',
      'Wie füge ich neue Nutzer zu meinem Team hinzu?',
      'Benutzer einladen',
    ],
    answer:
      '<p>Gehe zu <strong>Einstellungen → Team</strong> und klicke auf <strong>„Mitglied einladen"</strong>.</p>' +
      '<ul><li>Gib die E-Mail-Adresse der Person ein.</li><li>Wähle die passende Rolle: Betrachter, Bearbeiter oder Admin.</li><li>Die eingeladene Person muss die Einladung innerhalb von <strong>7 Tagen</strong> annehmen.</li></ul>',
  },
  {
    id: 'faq-007',
    questions: [
      'Was sind die Unterschiede zwischen den Abonnement-Plänen?',
      'Welchen Plan soll ich wählen?',
      'Free vs. Pro vs. Enterprise – Vergleich',
    ],
    answer:
      '<p>Wir bieten drei Pläne an:</p>' +
      '<ul>' +
      '<li><strong>Free:</strong> bis 3 Nutzer, 1 GB Speicher</li>' +
      '<li><strong>Pro:</strong> bis 25 Nutzer, 50 GB, Priority-Support</li>' +
      '<li><strong>Enterprise:</strong> unbegrenzte Nutzer, SSO, dedizierter Account Manager</li>' +
      '</ul>' +
      '<p>Eine detaillierte Übersicht findest du auf unserer <a href="/pricing">Preisseite</a>.</p>',
  },
  {
    id: 'faq-008',
    questions: [
      'Wie erreiche ich den Kundensupport?',
      'Wo bekomme ich Hilfe?',
      'Kontakt zum Support',
    ],
    answer:
      '<p>Unser Support-Team ist erreichbar über:</p>' +
      '<ul><li>E-Mail: <a href="mailto:support@example.com">support@example.com</a></li><li>In-App-Chat-Widget</li><li>Dedizierter Slack-Channel (Pro &amp; Enterprise)</li></ul>' +
      '<p>Die durchschnittliche Reaktionszeit beträgt unter <strong>4 Stunden</strong> an Werktagen.</p>',
  },
  {
    id: 'faq-009',
    questions: [
      'Gibt es eine mobile App?',
      'Ist die App auch fürs Handy verfügbar?',
      'iOS- und Android-App',
    ],
    answer:
      '<p>Ja, unsere App ist kostenlos für <strong>iOS</strong> (ab iOS 15) und <strong>Android</strong> (ab Android 10) verfügbar.</p>' +
      '<ul><li>Voller Funktionsumfang inklusive Offline-Modus für zuletzt geöffnete Inhalte</li><li><a href="#">Apple App Store</a></li><li><a href="#">Google Play Store</a></li></ul>',
  },
  {
    id: 'faq-010',
    questions: [
      'Welche Integrationen werden unterstützt?',
      'Kann ich die Plattform mit anderen Tools verbinden?',
      'Slack, Jira, GitHub Integration',
    ],
    answer:
      '<p>Native Integrationen:</p>' +
      '<ul><li>Slack, Microsoft Teams</li><li>Jira, GitHub</li><li>Google Drive, Zapier</li><li>Salesforce, SAP (Enterprise)</li></ul>' +
      '<p>Über unsere <strong>REST-API</strong> und Webhooks lassen sich darüber hinaus eigene Integrationen realisieren.</p>',
  },
  {
    id: 'faq-011',
    questions: [
      'Wie beantrage ich die Löschung meiner Daten (DSGVO)?',
      'Recht auf Vergessenwerden – wie gehe ich vor?',
      'Konto und Daten löschen',
    ],
    answer:
      '<p>Gemäß DSGVO hast du das Recht auf vollständige Löschung deiner Daten.</p>' +
      '<p>So stellst du deinen Löschantrag:</p>' +
      '<ul><li>Schriftlich an <a href="mailto:privacy@example.com">privacy@example.com</a></li><li>Direkt über <strong>Einstellungen → Datenschutz → „Konto löschen"</strong></li></ul>' +
      '<p>Die Löschung wird innerhalb von <strong>30 Tagen</strong> bestätigt und durchgeführt.</p>',
  },
  {
    id: 'faq-012',
    questions: [
      'Wie verwalte ich meine E-Mail-Benachrichtigungen?',
      'Zu viele E-Mails – wie schalte ich Benachrichtigungen ab?',
      'Notification-Einstellungen ändern',
    ],
    answer:
      '<p>Deine Benachrichtigungseinstellungen findest du unter <strong>Einstellungen → Benachrichtigungen</strong>.</p>' +
      '<p>Pro Kategorie (Kommentare, Erwähnungen, Berichte, Updates) kannst du wählen:</p>' +
      '<ul><li>Sofort</li><li>Täglich gebündelt</li><li>Gar nicht</li></ul>',
  },
  {
    id: 'faq-013',
    questions: [
      'Welche Verfügbarkeit (Uptime) garantiert ihr?',
      'Gibt es ein SLA?',
      'Systemstatus und Ausfallzeiten',
    ],
    answer:
      '<p>Wir garantieren eine Verfügbarkeit von <strong>99,9 %</strong> pro Monat gemäß unserem SLA.</p>' +
      '<ul><li>Aktuelle Systemstatus-Seite: <a href="https://status.example.com">status.example.com</a></li><li>Enterprise-Kunden erhalten bei Downtime automatisch eine anteilige Gutschrift.</li></ul>',
  },
  {
    id: 'faq-014',
    questions: [
      'Wie fange ich am besten mit der Plattform an (Onboarding)?',
      'Erste Schritte – wo fange ich an?',
      'Einführung und Tutorials',
    ],
    answer:
      '<p>Nach der Registrierung führt dich ein interaktiver <strong>Einrichtungsassistent</strong> durch die ersten Schritte.</p>' +
      '<p>Weitere Ressourcen:</p>' +
      '<ul><li>Schritt-für-Schritt-Anleitungen in der Wissensdatenbank</li><li>Kurze Video-Tutorials</li><li>Persönliche Kick-off-Calls für Pro- und Enterprise-Kunden (auf Anfrage)</li></ul>',
  },
  {
    id: 'faq-015',
    questions: [
      'Wie kann ich einen Feature-Wunsch einreichen?',
      'Wo kann ich Feedback geben?',
      'Neue Funktion vorschlagen',
    ],
    answer:
      '<p>Feature-Wünsche kannst du auf unserem öffentlichen <a href="https://feedback.example.com">Feedback-Board</a> einreichen und für bestehende Ideen abstimmen.</p>' +
      '<ul><li>Das Produktteam kommentiert regelmäßig den Status der meistgewünschten Features.</li><li>Ideen mit hoher Nachfrage fließen in unsere Roadmap ein.</li></ul>',
  },
  {
    id: 'faq-016',
    questions: [
      'Wie funktioniert die Preisgestaltung bei jährlicher Abrechnung?',
      'Wie viel spare ich mit dem Jahresabo?',
      'Jährliche vs. monatliche Zahlung',
    ],
    answer:
      '<p>Bei jährlicher Abrechnung erhältst du <strong>zwei Monate kostenlos</strong> – das entspricht einer Ersparnis von ca. 17 %.</p>' +
      '<ul><li>Der Jahresbetrag wird einmalig im Voraus berechnet.</li><li>Eine Kündigung während des Jahres ist möglich, wobei der verbleibende Betrag nicht erstattet wird.</li></ul>',
  },
  {
    id: 'faq-017',
    questions: [
      'Unterstützt ihr Single Sign-On (SSO)?',
      'Kann ich mich mit Okta oder Azure AD anmelden?',
      'SAML und OIDC konfigurieren',
    ],
    answer:
      '<p>SSO ist im <strong>Enterprise-Plan</strong> verfügbar und unterstützt:</p>' +
      '<ul><li>SAML 2.0</li><li>OIDC</li></ul>' +
      '<p>Kompatible Identity-Provider: Okta, Azure AD, Google Workspace, OneLogin. Die Einrichtung erfolgt in Absprache mit unserem Enterprise-Team.</p>',
  },
  {
    id: 'faq-018',
    questions: [
      'Wie richte ich Webhooks ein?',
      'Wie erhalte ich Echtzeit-Benachrichtigungen für Ereignisse?',
      'Webhook-URL konfigurieren',
    ],
    answer:
      '<p>Webhooks konfigurierst du unter <strong>Einstellungen → Entwickler → Webhooks</strong>.</p>' +
      '<ul><li>Wähle die gewünschten Ereignisse (z. B. „Dokument erstellt", „Kommentar hinzugefügt").</li><li>Gib deine Ziel-URL an.</li><li>Sichere den Endpoint mit einem geheimen Token.</li></ul>' +
      '<p>Jeder ausgehende Request enthält eine <strong>HMAC-Signatur</strong> zur Verifizierung.</p>',
  },
  {
    id: 'faq-019',
    questions: [
      'Welche Datei-Upload-Limits gelten?',
      'Wie groß darf eine hochgeladene Datei sein?',
      'Speicherlimit und Upload-Größe',
    ],
    answer:
      '<p>Die Upload-Limits hängen von deinem Plan ab:</p>' +
      '<ul>' +
      '<li><strong>Free:</strong> 25 MB pro Datei, 1 GB Gesamtspeicher</li>' +
      '<li><strong>Pro:</strong> 500 MB pro Datei, 50 GB Gesamtspeicher</li>' +
      '<li><strong>Enterprise:</strong> individuelle Limits, unbegrenzter Speicher möglich</li>' +
      '</ul>',
  },
  {
    id: 'faq-020',
    questions: [
      'Wie ändere ich meine Kontoinformationen oder E-Mail-Adresse?',
      'Profil bearbeiten',
      'Wie aktualisiere ich meine E-Mail?',
    ],
    answer:
      '<p>Deine Kontoinformationen (Name, Profilbild, Zeitzone) kannst du jederzeit unter <strong>Einstellungen → Profil</strong> anpassen.</p>' +
      '<p>Für eine Änderung der E-Mail-Adresse:</p>' +
      '<ul><li>Bestätigung an die neue Adresse erforderlich</li><li>Sicherheitsabfrage erforderlich</li><li>Bei aktiver 2FA: zusätzlich ein Authentifizierungscode</li></ul>',
  },
];
