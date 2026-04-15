# Wunschhimmel — Phase 2

## To Build
- [ ] DB: userProfiles.avatarUrl, listUpdates table, updateLikes, updateComments
- [ ] Storage: avatar upload + update photo upload
- [ ] API: avatar upload, list updates CRUD, likes, comments, reserve email notification, global feed
- [ ] Pages: /profile (avatar upload), /feed (global)
- [ ] Components: UpdatePost, UpdateFeed, AvatarUpload
- [ ] Update list-detail + shared pages with feed section

## Notes
- Avatar: upload to storage, save URL in userProfiles
- Updates: photo (optional) + text, tied to wishlist
- Private lists: updates visible only via share token
- Public lists: updates visible to all + in /feed
- Reserve notification: email to list owner via Resend
