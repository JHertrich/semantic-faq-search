export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    id: 'faq-001',
    question: 'Wie kann ich mein Passwort zurücksetzen?',
    answer:
      'Um dein Passwort zurückzusetzen, klicke auf der Anmeldeseite auf „Passwort vergessen". Du erhältst eine E-Mail mit einem sicheren Link, über den du ein neues Passwort festlegen kannst. Der Link ist 24 Stunden gültig und kann nur einmal verwendet werden.',
  },
  {
    id: 'faq-002',
    question: 'Welche Zahlungsmethoden werden akzeptiert?',
    answer:
      'Wir akzeptieren Kreditkarten (Visa, Mastercard, American Express), SEPA-Lastschrift sowie PayPal. Für Jahresabonnements ist zusätzlich die Zahlung per Rechnung möglich. Alle Zahlungen werden über verschlüsselte, PCI-DSS-konforme Verbindungen abgewickelt.',
  },
  {
    id: 'faq-003',
    question: 'Wie aktiviere ich die Zwei-Faktor-Authentifizierung (2FA)?',
    answer:
      'Die Zwei-Faktor-Authentifizierung kannst du in den Kontoeinstellungen unter „Sicherheit" aktivieren. Unterstützt werden Authenticator-Apps wie Google Authenticator oder Authy. Nach der Aktivierung wird bei jeder Anmeldung ein einmaliger Code verlangt.',
  },
  {
    id: 'faq-004',
    question: 'Wie erstelle ich einen API-Schlüssel?',
    answer:
      'API-Schlüssel kannst du in den Entwicklereinstellungen deines Kontos unter „API & Integrationen" erstellen. Du kannst Schlüsseln Namen und Berechtigungen (Lesen/Schreiben) zuweisen sowie ein Ablaufdatum setzen. Behandle API-Schlüssel wie Passwörter – teile sie niemals öffentlich.',
  },
  {
    id: 'faq-005',
    question: 'Wie exportiere ich meine Daten?',
    answer:
      'Einen vollständigen Datenexport kannst du unter Einstellungen → Datenschutz → „Meine Daten exportieren" anfordern. Der Export wird als ZIP-Archiv im JSON-Format bereitgestellt und an deine hinterlegte E-Mail-Adresse gesendet. Die Vorbereitung kann bis zu 24 Stunden dauern.',
  },
  {
    id: 'faq-006',
    question: 'Wie lade ich Teammitglieder ein?',
    answer:
      'Gehe zu Einstellungen → Team und klicke auf „Mitglied einladen". Gib die E-Mail-Adresse der Person ein und wähle die passende Rolle (Betrachter, Bearbeiter oder Admin). Die eingeladene Person erhält eine E-Mail und muss die Einladung innerhalb von 7 Tagen annehmen.',
  },
  {
    id: 'faq-007',
    question: 'Was sind die Unterschiede zwischen den Abonnement-Plänen?',
    answer:
      'Wir bieten drei Pläne an: Free (bis 3 Nutzer, 1 GB Speicher), Pro (bis 25 Nutzer, 50 GB, Priority-Support) und Enterprise (unbegrenzte Nutzer, SSO, dedizierter Account Manager). Eine detaillierte Übersicht der enthaltenen Funktionen findest du auf unserer Preisseite.',
  },
  {
    id: 'faq-008',
    question: 'Wie erreiche ich den Kundensupport?',
    answer:
      'Unser Support-Team ist per E-Mail (support@example.com) und über das In-App-Chat-Widget erreichbar. Pro- und Enterprise-Kunden erhalten zusätzlich Zugang zu einem dedizierten Slack-Channel. Die durchschnittliche Reaktionszeit beträgt unter 4 Stunden an Werktagen.',
  },
  {
    id: 'faq-009',
    question: 'Gibt es eine mobile App?',
    answer:
      'Ja, unsere App ist kostenlos für iOS (ab iOS 15) und Android (ab Android 10) verfügbar. Die mobile App bietet den vollen Funktionsumfang inklusive Offline-Modus für zuletzt geöffnete Inhalte. Du findest sie im Apple App Store und im Google Play Store.',
  },
  {
    id: 'faq-010',
    question: 'Welche Integrationen werden unterstützt?',
    answer:
      'Wir bieten native Integrationen für Slack, Microsoft Teams, Jira, GitHub, Google Drive und Zapier. Über unsere REST-API und Webhooks lassen sich eigene Integrationen realisieren. Im Enterprise-Plan sind zusätzlich Salesforce- und SAP-Konnektoren enthalten.',
  },
  {
    id: 'faq-011',
    question: 'Wie beantrage ich die Löschung meiner Daten (DSGVO)?',
    answer:
      'Gemäß DSGVO hast du das Recht auf vollständige Löschung deiner Daten. Stelle deinen Löschantrag schriftlich an privacy@example.com oder direkt über Einstellungen → Datenschutz → „Konto löschen". Die Löschung wird innerhalb von 30 Tagen bestätigt und durchgeführt.',
  },
  {
    id: 'faq-012',
    question: 'Wie verwalte ich meine E-Mail-Benachrichtigungen?',
    answer:
      'Deine Benachrichtigungseinstellungen findest du unter Einstellungen → Benachrichtigungen. Du kannst für jede Kategorie (Kommentare, Erwähnungen, Berichte, Updates) einzeln wählen, ob du E-Mails sofort, täglich gebündelt oder gar nicht erhalten möchtest.',
  },
  {
    id: 'faq-013',
    question: 'Welche Verfügbarkeit (Uptime) garantiert ihr?',
    answer:
      'Wir garantieren eine Verfügbarkeit von 99,9 % pro Monat gemäß unserem SLA (Service Level Agreement). Die aktuelle Systemstatus-Seite findest du unter status.example.com. Im Falle einer Downtime erhalten Enterprise-Kunden automatisch eine anteilige Gutschrift.',
  },
  {
    id: 'faq-014',
    question: 'Wie fange ich am besten mit der Plattform an (Onboarding)?',
    answer:
      'Nach der Registrierung führt dich ein interaktiver Einrichtungsassistent durch die ersten Schritte. In der Wissensdatenbank findest du zusätzlich Schritt-für-Schritt-Anleitungen und kurze Video-Tutorials. Unser Onboarding-Team bietet auch persönliche Kick-off-Calls für Pro- und Enterprise-Kunden an.',
  },
  {
    id: 'faq-015',
    question: 'Wie kann ich einen Feature-Wunsch einreichen?',
    answer:
      'Feature-Wünsche kannst du auf unserem öffentlichen Feedback-Board unter feedback.example.com einreichen und für bestehende Ideen abstimmen. Das Produktteam kommentiert regelmäßig den Status der meistgewünschten Features. Ideen mit hoher Nachfrage fließen in unsere Roadmap ein.',
  },
  {
    id: 'faq-016',
    question: 'Wie funktioniert die Preisgestaltung bei jährlicher Abrechnung?',
    answer:
      'Bei jährlicher Abrechnung erhältst du zwei Monate kostenlos – das entspricht einer Ersparnis von ca. 17 % gegenüber der monatlichen Zahlung. Der Jahresbetrag wird einmalig im Voraus berechnet. Eine Kündigung während des Jahres ist möglich, wobei der verbleibende Betrag nicht erstattet wird.',
  },
  {
    id: 'faq-017',
    question: 'Unterstützt ihr Single Sign-On (SSO)?',
    answer:
      'SSO ist im Enterprise-Plan verfügbar und unterstützt die Protokolle SAML 2.0 und OIDC. Kompatible Identity-Provider sind unter anderem Okta, Azure AD, Google Workspace und OneLogin. Die Einrichtung erfolgt in Absprache mit unserem Enterprise-Team.',
  },
  {
    id: 'faq-018',
    question: 'Wie richte ich Webhooks ein?',
    answer:
      'Webhooks kannst du unter Einstellungen → Entwickler → Webhooks anlegen. Wähle die Ereignisse (z. B. „Dokument erstellt", „Kommentar hinzugefügt"), gib deine Ziel-URL an und sichere sie mit einem geheimen Token. Jeder ausgehende Request enthält eine HMAC-Signatur zur Verifizierung.',
  },
  {
    id: 'faq-019',
    question: 'Welche Datei-Upload-Limits gelten?',
    answer:
      'Im Free-Plan ist der Upload auf 25 MB pro Datei und 1 GB Gesamtspeicher begrenzt. Im Pro-Plan sind einzelne Dateien bis 500 MB und 50 GB Gesamtspeicher erlaubt. Enterprise-Kunden können individuelle Limits und unbegrenzten Speicher vereinbaren.',
  },
  {
    id: 'faq-020',
    question: 'Wie ändere ich meine Kontoinformationen oder E-Mail-Adresse?',
    answer:
      'Deine Kontoinformationen (Name, Profilbild, Zeitzone) kannst du jederzeit unter Einstellungen → Profil anpassen. Eine Änderung der E-Mail-Adresse erfordert eine Bestätigung an die neue Adresse sowie eine Sicherheitsabfrage. Bei aktiver 2FA wird zusätzlich ein Authentifizierungscode verlangt.',
  },
];
