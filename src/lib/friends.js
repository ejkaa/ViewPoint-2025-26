import { supabase } from "./supabase"

/* MUTUALS (existing friends system) */
export async function getMyFriends() {
    const { data, error } = await supabase.rpc(
        "get_my_friends"
    )

    if (error) throw error

    return data
}

/* FOLLOWING */
export async function getFollowing() {
    const { data, error } = await supabase.rpc(
        "get_my_following"
    )

    if (error) throw error

    return data
}

/* FOLLOWERS */
export async function getFollowers() {
    const { data, error } = await supabase.rpc(
        "get_my_followers"
    )

    if (error) throw error

    return data
}

/* FOLLOW USER */
export async function addFriendByEmail(email) {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: friendId, error: rpcError } =
        await supabase.rpc("get_user_id_by_email", {
            p_email: email,
        })

    if (rpcError) throw rpcError

    if (!friendId) {
        throw new Error("User not found")
    }

    if (friendId === user.id) {
        throw new Error("You cannot add yourself")
    }

    const { error } = await supabase
        .from("follows")
        .insert({
            follower_id: user.id,
            following_id: friendId,
        })

    if (error) {
        if (error.code === "23505") {
            throw new Error("Already following")
        }

        throw error
    }
}