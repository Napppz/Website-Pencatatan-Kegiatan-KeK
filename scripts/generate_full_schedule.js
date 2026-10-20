const startDate = new Date('2026-09-23T00:00:00');
const endDate = new Date('2026-12-23T00:00:00');

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

let cur = new Date(startDate);
let weeks = [];
let curWeek = [];
let weekIndex = 1;

while (cur <= endDate) {
  const d = cur.getDay();
  if (d >= 1 && d <= 5) { // workday
    curWeek.push({
      date: new Date(cur),
      dayName: days[d],
      day: cur.getDate(),
      month: months[cur.getMonth()],
      year: cur.getFullYear(),
      dateStr: days[d] + ',\n' + cur.getDate() + ' ' + months[cur.getMonth()] + ' ' + cur.getFullYear(),
      isFriday: d === 5,
      isTarget: cur >= new Date('2026-10-19T00:00:00')
    });
    // If Tuesday, week ends
    if (d === 2 || cur.getTime() === endDate.getTime()) {
      weeks.push({ weekNum: weekIndex, days: curWeek });
      weekIndex++;
      curWeek = [];
    }
  }
  cur.setDate(cur.getDate() + 1);
}

if (curWeek.length > 0) {
  weeks.push({ weekNum: weekIndex, days: curWeek });
}

console.log('Total weeks generated:', weeks.length);
weeks.forEach(w => {
  console.log('\n--- MINGGU ' + w.weekNum + ' (' + w.days.length + ' hari kerja) ---');
  w.days.forEach(d => {
    console.log('  ' + d.dayName + ', ' + d.day + ' ' + d.month + ' ' + d.year + (d.isTarget ? ' [TARGET]' : ' [EXISTING]') + (d.isFriday ? ' (WFH)' : ''));
  });
});
