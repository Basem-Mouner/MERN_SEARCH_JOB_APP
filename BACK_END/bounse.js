/*
by js You are given an integer array nums.
 You are initially positioned at the array's first index,
  and each element in the array represents your maximum jump length at that position. 

Return true if you can reach the last index, or false otherwise.

Example 1:

Input: nums = [2,3,1,1,4]
Output: true
Explanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.
Example 2:

Input: nums = [3,2,1,0,4]
Output: false
Explanation: You will always arrive at index 3 no matter what.
 Its maximum jump length is 0, which makes it impossible to reach the last index.
*/


var canJump = function(nums) {
    // let maxReach = 0;

    // for (let i = 0; i < nums.length; i++) {
    //     if (i > maxReach) return false; // If we reach a point we can't move past
    //     maxReach = Math.max(maxReach, i + nums[i]); // Update the maxReach position
    //     if (maxReach >= nums.length - 1) return true; // If we can reach the last index
    // }
    
    // return false;
    let reach = 0, i = 0;

    while (i <= reach) {
        reach = Math.max(reach, i + nums[i]); // تحديث أبعد نقطة نقدر نوصلها
        if (reach >= nums.length - 1) return true; // ✅ إذا قدرنا نوصل للنهاية، نرجع true
        i++;
    }
    
    return false; // ❌ لو وقفنا قبل ما نوصل للنهاية، نرجع false
};

// Example test cases
console.log(canJump([2,3,1,1,4])); // true
console.log(canJump([3,2,1,0,4])); // false