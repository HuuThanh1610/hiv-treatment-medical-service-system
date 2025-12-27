# Active Schedule Filter for Doctor Leave Request - Implementation Summary

## Request
"phần bác sĩ gửi form đơn xin nghỉ , khi chọn ca thì tôi muốn lấy danh sách các lịch trạng thái ACTIVE của bác sĩ đó"

## Solution Implemented

### 1. **Added Active Schedule Filtering**

**File**: `frontend/src/components/DoctorProfile/DoctorScheduleTable.jsx`

#### Before:
```jsx
// Show all schedules (ACTIVE and CANCELLED) in leave request form
{slotsThisWeek.map(s => (
    <option key={s.id} value={s.id}>
        {s.date} | {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
    </option>
))}
```

#### After:
```jsx
// Filter only ACTIVE schedules for leave request form (future dates only)
const todayForComparison = new Date();
todayForComparison.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

const activeSlotsForLeaveRequest = schedules.filter(s => {
    const d = parseLocalDate(s.date);
    return s.status === 'ACTIVE' && d >= todayForComparison && d >= weekStart && d < new Date(weekStart.getTime() + 7 * 86400000);
});

// In the select dropdown:
{activeSlotsForLeaveRequest.length > 0 ? (
    activeSlotsForLeaveRequest.map(s => (
        <option key={s.id} value={s.id}>
            {s.date} | {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)} | {s.status}
        </option>
    ))
) : (
    <option value='' disabled>Không có ca ACTIVE nào trong tuần này</option>
)}
```

### 2. **Enhanced User Experience**

#### A. **Clear Labeling**
- Updated label from "Chọn ca cần nghỉ:" to "Chọn ca cần nghỉ (chỉ ca ACTIVE):"
- Added status indicator in dropdown options

#### B. **Smart Button State**
```jsx
<button 
    type="submit" 
    disabled={activeSlotsForLeaveRequest.length === 0 || !selectedSlot || !reason}
    style={{ 
        background: (activeSlotsForLeaveRequest.length === 0 || !selectedSlot || !reason) ? '#ccc' : '#1976d2', 
        cursor: (activeSlotsForLeaveRequest.length === 0 || !selectedSlot || !reason) ? 'not-allowed' : 'pointer' 
    }}
>
    Gửi
</button>
```

#### C. **Enhanced Validation**
```jsx
// Validate that the selected schedule is ACTIVE
if (slotObj.status !== 'ACTIVE') {
    setError('Chỉ có thể gửi yêu cầu nghỉ cho ca có trạng thái ACTIVE');
    return;
}
```

### 3. **Filtering Logic**

The new filter applies **three conditions**:

1. **Status Filter**: `s.status === 'ACTIVE'`
2. **Date Filter**: `d >= todayForComparison` (no past dates)
3. **Week Filter**: `d >= weekStart && d < new Date(weekStart.getTime() + 7 * 86400000)` (current week only)

### 4. **Edge Cases Handled**

#### A. **No Active Schedules**
- Shows message: "Không có ca ACTIVE nào trong tuần này"
- Disables submit button
- Provides clear feedback to user

#### B. **Past Dates**
- Automatically filters out past dates
- Prevents doctors from requesting leave for completed shifts

#### C. **Non-Active Status**
- Excludes CANCELLED, INACTIVE, or other status schedules
- Only shows schedules that can actually be cancelled

### 5. **Visual Improvements**

#### A. **Status Indicator**
Each option now shows: `Date | Time | Status`
Example: `2025-08-05 | 08:00 - 09:00 | ACTIVE`

#### B. **Disabled State Styling**
- Grayed out submit button when no valid schedules
- Clear visual feedback for form state

#### C. **Error Messaging**
- Specific error for invalid schedule selection
- Clear guidance on what schedules are valid

## Benefits

### ✅ **Business Logic Compliance**
- Ensures only valid schedules can be selected for leave requests
- Prevents confusion from showing unavailable options

### ✅ **Data Integrity**
- Validates schedule status before submission
- Prevents requests for cancelled or inactive schedules

### ✅ **User Experience**
- Clear feedback when no schedules available
- Intuitive form behavior with proper button states
- Helpful error messages

### ✅ **Performance**
- Client-side filtering reduces unnecessary API calls
- Efficient filtering logic with minimal performance impact

## Test Coverage

Created comprehensive test file: `TEST_ACTIVE_SCHEDULE_FILTER.js`

**Test Scenarios**:
1. Filter only ACTIVE status schedules
2. Exclude past dates
3. Handle no ACTIVE schedules case
4. Validate edge cases (all cancelled, all past, etc.)
5. Verify correct schedule IDs in results

## Backward Compatibility

✅ **No Breaking Changes**
- Original schedule display (table view) unchanged
- Only affects leave request form dropdown
- All existing functionality preserved

## Summary

The implementation successfully addresses the requirement: **"lấy danh sách các lịch trạng thái ACTIVE của bác sĩ đó"**

**Key Features**:
- ✅ Shows only ACTIVE status schedules
- ✅ Filters out past dates
- ✅ Clear user feedback
- ✅ Proper validation
- ✅ Enhanced UX with disabled states

**Result**: Doctors now see only relevant, actionable schedules when requesting leave, improving both user experience and data integrity.
