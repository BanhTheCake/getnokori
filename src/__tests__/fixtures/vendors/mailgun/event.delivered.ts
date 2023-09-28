export default `{ 
    "event-data":{
    "id": "CPgfbmQMTCKtHW6uIWtuVe",
    "timestamp": 1521472262.908181,
    "log-level": "info",
    "event": "delivered",
    "delivery-status": {
        "tls": true,
        "mx-host": "smtp-in.example.com",
        "code": 250,
        "description": null,
        "session-seconds": 0.4331989288330078,
        "utf8": true,
        "attempt-no": 1,
        "message": "OK",
        "certificate-verified": true
    },
    "flags": {
        "is-routed": false,
        "is-authenticated": true,
        "is-system-test": false,
        "is-test-mode": false
    },
    "envelope": {
        "transport": "smtp",
        "sender": "bob@m.nokori.com",
        "sending-ip": "209.61.154.250",
        "targets": "alice@example.com"
    },
    "message": {
        "headers": {
            "to": "Alice <alice@example.com>",
            "message-id": "20230608171628.67f96fa42ee5e979@m.nokori.com",
            "from": "Bob <bob@m.nokori.com>",
            "subject": "Test delivered webhook"
        },
        "attachments": [],
        "size": 111
    },
    "recipient": "alice@example.com",
    "recipient-domain": "example.com",
    "storage": {
        "url": "https:\/\/se.api.mailgun.net\/v3\/domains\/m.nokori.com\/messages\/message_key",
        "key": "message_key"
    },
    "campaigns": [],
    "tags": [
        "my_tag_1",
        "my_tag_2"
    ],
    "user-variables": {
        "my_var_1": "Mailgun Variable #1",
        "my-var-2": "awesome"
    }
    }
}`
