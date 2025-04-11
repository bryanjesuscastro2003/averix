git add .
git commit -m "update"

git push origin main

# reset commit

git reset --soft HEAD~1
git reset --mixed HEAD~1
git reset --hard HEAD~1

# revert commit

git revert HEAD
git revert HEAD~1
git revert HEAD~2

# reset changes

git restore .
git restore --staged .

# update a branch

git checkout -b new-branch
git pull origin main

# merge a branch

git checkout main
git merge new-branch
git branch -d new-branch

# merge with conflict

git checkout -b new-branch
git pull origin main
git checkout main
git merge new-branch -X theirs  
git merge new-branch -X ours
