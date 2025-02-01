import { TinderAPI } from "@/tinder.ts";

const xAuthToken = 'YOUR_AUTH_TOKEN'

const api = new TinderAPI({ xAuthToken })
const firstMatch = (await api.getMatches({ message: 1 })).data.data.matches.at(0)!
console.log(await api.getChatMessages({ matchId: firstMatch.id }))
/* const results = await api.search()

console.log(await api.like({
    userId: profile.user._id,
    liked_content_id: profile.user.photos.at(0)?.id!,
})) */
