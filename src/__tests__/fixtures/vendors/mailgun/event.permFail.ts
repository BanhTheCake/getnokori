export default `{
    "event-data": {
        "id": "G9Bn5sl1TC6nu79C8C0bwg",
        "timestamp": 1521233195.375624,
        "log-level": "error",
        "event": "failed",
        "severity": "permanent",
        "reason": "suppress-bounce",
        "delivery-status": {
            "attempt-no": 1,
            "message": null,
            "code": 605,
            "enhanced-code": null,
            "description": "Not delivering to previously bounced address",
            "session-seconds": 0
        },
        "flags": {
            "is-routed": false,
            "is-authenticated": true,
            "is-system-test": false,
            "is-test-mode": false
        },
        "envelope": {
            "sender": "bob@m.nokori.com",
            "transport": "smtp",
            "targets": "alice@example.com"
        },
        "message": {
            "headers": {
                "to": "Alice <alice@example.com>",
                "message-id": "20230608171839.8bf4bf72785b8dcd@m.nokori.com",
                "from": "Bob <bob@m.nokori.com>",
                "subject": "Test permanent_fail webhook"
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
