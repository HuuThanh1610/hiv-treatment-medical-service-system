import React from 'react';

/**
 * Date picker + shift select for leave request
 * @param {Object[]} schedules - all doctor schedules
 * @param {string} selectedDate - yyyy-mm-dd
 * @param {function} setSelectedDate
 * @param {string} selectedSlotId
 * @param {function} setSelectedSlotId
 */
export default function LeaveRequestDatePicker({ schedules, selectedDate, setSelectedDate, selectedSlotId, setSelectedSlotId }) {
  // Lọc ra các ngày có ca làm việc tương lai
  const today = new Date();
  today.setHours(0,0,0,0);
  const availableDates = Array.from(new Set(
    schedules.filter(s => s.status === 'ACTIVE' && new Date(s.date) >= today).map(s => s.date)
  ));
  // Lọc ca theo ngày được chọn
  const slotsForDate = schedules.filter(s => s.status === 'ACTIVE' && s.date === selectedDate);

  return (
    <>
      <div style={{marginBottom:12}}>
        <label>Chọn ngày nghỉ: </label>
        <select value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedSlotId(''); }} style={{width:'100%',padding:6,borderRadius:4,border:'1px solid #ccc'}}>
          <option value=''>-- Chọn ngày --</option>
          {availableDates.map(date => <option key={date} value={date}>{date}</option>)}
        </select>
      </div>
      <div style={{marginBottom:16}}>
        <label>Chọn ca cần nghỉ: </label>
        <select value={selectedSlotId} onChange={e => setSelectedSlotId(e.target.value)} style={{width:'100%',padding:6,borderRadius:4,border:'1px solid #ccc'}} disabled={!selectedDate}>
          <option value=''>-- Chọn ca --</option>
          {slotsForDate.length > 0 ? (
            slotsForDate.map(s => (
              <option key={s.id} value={s.id}>{s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)}</option>
            ))
          ) : (
            <option value='' disabled>Không có ca nào</option>
          )}
        </select>
      </div>
    </>
  );
}
