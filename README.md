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

3##

Since you want to completely prefer all changes from branchA and overwrite branchB (including resolving any conflicts in favor of branchA), here's how to do it:
Method 1: Hard Reset (Fastest & Cleanest)

This will make branchB identical to branchA:
bash

# Switch to branchB

git checkout branchB

# Make branchB exactly match branchA (including all files, history, etc.)

git reset --hard branchA

# Force push to remote (if needed)

git push origin branchB --force-with-lease

####################3
Method 2: Merge with "Ours" Strategy

If you prefer a merge commit (keeps branchB's history):
bash
Copy

git checkout branchB
git merge -X theirs branchA # Prefer ALL changes from branchA in conflicts

# If any unmerged files remain (shouldn't happen with -X theirs)

git checkout branchA -- . # Overwrite all files with branchA versions
git add .
git commit -m "Merge branchA: Preferring all changes from branchA"
git push origin branchB

##########################
Method 3: Checkout All Files from BranchA

Alternative if you just want the files but keep branchB's commits:
bash
Copy

git checkout branchB
git checkout branchA -- . # Take all files from branchA
git commit -m "Overwrite all files with branchA version"
git push origin branchB
