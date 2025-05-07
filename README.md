# tinder-api

`tinder-api` is an unofficial library to interact with Tinder's API. Designed to work seamlessly with both Node.js and Deno, it simplifies the process of performing actions such as liking, disliking, and retrieving profiles, as well as
accessing search results.

## Features

-   Perform searches for profiles.
-   Like or dislike profiles.
-   Retrieve authenticated user profile information.
-   Designed for flexibility and easy integration.

## Installation

### Node.js

Install the package via npm:

```bash
npm install tinder-api-ts
```

```bash
yarn add tinder-api-ts
```

```bash
pnpm i tinder-api-ts
```

### Deno

Import the package directly from the repository URL:

```bash
deno add jsr:@miguelo/tinder-api
```

## Authentication Token

To use the `tinder-api`, you need to retrieve your `X-AUTH-TOKEN` from Tinder web. Here's how you can obtain it:

### Steps to Get Your Token:

1. Open your browser and navigate to the Tinder website.
2. Open **Developer Tools** (usually by pressing `F12` or `Ctrl+Shift+I`).
3. Go to the **Application** tab.
4. Locate **IndexedDB** in the **Storage** section.
5. Find the `keyval-store` database and the `keyval` store.
6. Search for the key `persist::mfa`.
7. Extract the `authToken` value from the result.

Alternatively, use this script in your browser console to retrieve the token:

```javascript
const dbName = 'keyval-store';
const storeName = 'keyval';
const key = 'persist::mfa';

const dbPromise = indexedDB.open(dbName);

dbPromise.onsuccess = function (event) {
    const db = event.target.result;

    // Creamos una transacción de lectura (Create a read-only transaction)
    const transaction = db.transaction([storeName], 'readonly');

    // Obtenemos el objeto store (Get the store object)
    const objectStore = transaction.objectStore(storeName);

    // Realizamos la petición para obtener el valor (Make the request to get the value)
    const request = objectStore.get(key);

    request.onsuccess = function (event) {
        const result = JSON.parse(event.target.result);
        console.log(result.authToken);
    };

    request.onerror = function (event) {
        console.error('Error al obtener el valor:', event.target.error);
    };
};

dbPromise.onerror = function (event) {
    console.error('Error al abrir la base de datos:', event.target.error);
};
```

## Usage

### Init API client example

```typescript
import { TinderAPI } from 'tinder-api';

const api = new TinderAPI({ xAuthToken: 'your_auth_token' });
```

### Search profiles and give like example

```typescript
const results = await api.search();
const profile = results.data.data.results[0];

// Like a profile
const likeResponse = await api.like({
    s_number: profile.s_number,
    userId: profile.user._id,
    liked_content_id: profile.user.photos.at(0)?.id!,
    liked_content_type: 'photo',
});
```

## API Methods

| Method                                                                                       | Description                                                                                          |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --- |
| `search(params?: TinderSearchParams): Promise<TinderResponse<TinderSearchResponse>>`         | Search for profiles.                                                                                 |
| `like(params: TinderLikeParams): Promise<TinderResponse<TinderLikeResponse>>`                | Like a profile.                                                                                      |
| `dislike(params: TinderDislikeParams): Promise<TinderResponse<TinderDislikeResponse>>`       | Dislike a profile.                                                                                   |
| `profile(params?: TinderProfileParams): Promise<TinderResponse<TinderProfileResponse>>`      | Retrieve authenticated user profile.                                                                 |
| `setLocation(params: TinderLocationParams): Promise<TinderResponse<TinderLocationResponse>>` | Sets the user's location using latitude and longitude. Note: Can only be used once every 10 minutes. |
| `getMatches(params?: TinderMatchesParams): Promise<TinderResponse<TinderMatchesResponse>>` | Retrieve matches for the authenticated user. |
| `getChatMessages(params: TinderChatMessagesParams): Promise<TinderResponse<TinderChatMessagesResponse>>` | Retrieve chat messages for a specific match. |

## Interfaces

### TinderSearchParams

Parameters for searching profiles.

| Property | Type     | Description                       |
| -------- | -------- | --------------------------------- |
| `locale` | `string` | The locale to use for the search. |

### TinderLikeParams

Parameters for liking a profile.

| Property             | Type     | Description                         |
| -------------------- | -------- | ----------------------------------- |
| `userId`             | `string` | The ID of the profile to like.      |
| `s_number`           | `string` | The session number for the request. |
| `liked_content_id`   | `string` | The ID of the content to like.      |
| `liked_content_type` | `string` | The type of content to like.        |

### TinderDislikeParams

Parameters for disliking a profile.

| Property   | Type     | Description                         |
| ---------- | -------- | ----------------------------------- |
| `userId`   | `string` | The ID of the profile to dislike.   |
| `s_number` | `string` | The session number for the request. |

### TinderProfileParams

Parameters for retrieving the authenticated user profile.

| Property | Type       | Description                                 |
| -------- | ---------- | ------------------------------------------- |
| `locale` | `string`   | The locale to use for the profile.          |
| `scopes` | `string[]` | Additional data to include in the response. |

### TinderLocationParams

Parameters for setting user location.

| Property | Type     | Description                            |
| -------- | -------- | -------------------------------------- |
| `locale` | `string` | The locale to use for the request.     |
| `lat`    | `number` | Latitude coordinate for the location.  |
| `lon`    | `number` | Longitude coordinate for the location. |

### TinderMatchesParams

Parameters for retrieving matches.

| Property  | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `message` | `number` | Number of messages to include in the response. |

### TinderChatMessagesParams

Parameters for retrieving chat messages.

| Property  | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `matchId` | `string` | The ID of the match to query.  |

## Error Handling

The library throws detailed errors if a request fails. Wrap your calls in `try-catch` to handle exceptions gracefully.

```typescript
try {
    const results = await api.search();
    console.log(results);
} catch (error) {
    console.error('Error:', error.message);
}
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

Contributions are welcome! If you encounter issues, have ideas for improvements, or want to contribute new features, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/Miguelo981/tinder-api).

### Guidelines:

1. **Fork the repository** and create a new branch for your feature or bug fix.
2. Ensure your code adheres to the project's coding standards.
3. Write tests for any new functionality or changes.
4. Submit a detailed pull request describing your changes.

Thank you for your contributions!
