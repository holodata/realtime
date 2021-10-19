# holodata API

REST or GraphQL API.

```jsonc
// https://api.holodata.org/youtube/UC7fk0CB07ly8oSl0aqKkqFg
{
  "id": "UC7fk0CB07ly8oSl0aqKkqFg",
  "name": "Nakiri Ayame Ch. 百鬼あやめ",
  "language": "ja",
  "associated": ["v/nakiriayame"]
}
```

```jsonc
// https://api.holodata.org/v/nakiri-ayame
{
  "id": "nakiri-ayame",
  "canonical_name": "百鬼あやめ", // string
  "name": {
    "ja": "百鬼あやめ",
    "en": "Nakiri Ayame"
  },
  "birthday": "12-13", // string | undefined
  "debut_at": "2018-09-03", // string | undefined
  "age": ">=1500", // number | string | undefined
  "height": 152, // number | string | undefined
  "emoji": "👿", // string | undefined
  "gender": "female", // "female", "male", "other", undefined
  "affiliation": "hololive", // string | null | undefined
  "links": {
    "youtube": [
      {
        "id": "UC7fk0CB07ly8oSl0aqKkqFg",
        "name": "Nakiri Ayame Ch. 百鬼あやめ",
        "language": "ja"
      }
    ],
    "twitter": [
      {
        "id": "nakiriayame",
        "language": "ja"
      }
    ],
    "web": [
      {
        "type": "official",
        "url": "https://en.hololive.tv/portfolio/items/433583",
        "language": "en"
      },
      {
        "type": "official",
        "url": "https://www.hololive.tv/portfolio/items/336384",
        "language": "ja"
      }
    ]
  }
}
```

- Biography
  - Name
  - Birthday
  - Debut date
- Social accounts
- Statistics
  - from Vtuber Dataset
- Collab (hope)
