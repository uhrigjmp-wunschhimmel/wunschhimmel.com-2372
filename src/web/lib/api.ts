const base = "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Wishlists
  getLists: () => req<any[]>("/wishlists"),
  createList: (data: any) => req<any>("/wishlists", { method: "POST", body: JSON.stringify(data) }),
  getList: (id: string) => req<any>(`/wishlists/${id}`),
  updateList: (id: string, data: any) => req<any>(`/wishlists/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteList: (id: string) => req<any>(`/wishlists/${id}`, { method: "DELETE" }),

  // Wishes
  addWish: (listId: string, data: any) => req<any>(`/wishlists/${listId}/wishes`, { method: "POST", body: JSON.stringify(data) }),
  updateWish: (wishId: string, data: any) => req<any>(`/wishes/${wishId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteWish: (wishId: string) => req<any>(`/wishes/${wishId}`, { method: "DELETE" }),

  // Scrape
  scrape: (url: string) => req<any>("/scrape", { method: "POST", body: JSON.stringify({ url }) }),

  // Share
  shareList: (listId: string, data: any) => req<any>(`/wishlists/${listId}/share`, { method: "POST", body: JSON.stringify(data) }),

  // Public
  getShared: (token: string) => req<any>(`/shared/${token}`),
  reserveWish: (token: string, wishId: string, name: string) =>
    req<any>(`/shared/${token}/wishes/${wishId}/reserve`, { method: "POST", body: JSON.stringify({ name }) }),
  unreserveWish: (token: string, wishId: string) =>
    req<any>(`/shared/${token}/wishes/${wishId}/unreserve`, { method: "POST", body: JSON.stringify({}) }),

  // Explore
  explore: () => req<any[]>("/explore"),

  // Profile
  getProfile: () => req<any>("/profile"),
  getUserProfile: (userId: string) => req<any>(`/users/${userId}/profile`),
  uploadAvatar: (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return fetch("/api/profile/avatar", { method: "POST", credentials: "include", body: fd }).then(r => r.json());
  },

  // Updates
  getUpdates: (listId: string) => req<any[]>(`/wishlists/${listId}/updates`),
  createUpdate: (listId: string, text: string, photo?: File) => {
    const fd = new FormData(); fd.append("text", text); if (photo) fd.append("photo", photo);
    return fetch(`/api/wishlists/${listId}/updates`, { method: "POST", credentials: "include", body: fd }).then(r => r.json());
  },
  deleteUpdate: (id: string) => req<any>(`/updates/${id}`, { method: "DELETE" }),
  getSharedUpdates: (token: string) => req<any[]>(`/shared/${token}/updates`),
  likeUpdate: (id: string, name: string) => req<any>(`/updates/${id}/like`, { method: "POST", body: JSON.stringify({ name }) }),
  addComment: (id: string, authorName: string, text: string) => req<any>(`/updates/${id}/comments`, { method: "POST", body: JSON.stringify({ authorName, text }) }),

  // Global feed
  getFeed: () => req<any[]>("/feed"),
};
