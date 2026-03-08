import requests

url = "http://localhost:8500/generate-schedule/"
payload = {
  "tasks": [
    {
      "title": "Task 1",
      "due_date": "2026-03-10",
      "estimated_hours": 3
    }
  ],
  "availability": {
    "start_date": "2026-03-08",
    "end_date": "2026-03-15",
    "daily_available_hours": 8,
    "preferred_time_blocks": [
      [
        "09:00",
        "17:00"
      ]
    ]
  }
}

res1 = requests.post(url, json=payload)
print("Req 1:", res1.status_code, res1.text)

res2 = requests.post(url, json=payload)
print("Req 2:", res2.status_code, res2.text)
