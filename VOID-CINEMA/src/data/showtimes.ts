export const DEFAULT_SHOWTIMES = [
  '10:30 AM',
  '01:45 PM',
  '05:20 PM',
  '09:10 PM'
];

export const getShowtimesForTheatre = (theatreId: string, date: string): string[] => {
  // Mock variation logic to make different theatres look realistic
  if (theatreId === 't-005') return ['08:00 AM', ...DEFAULT_SHOWTIMES]; // Morning show for mass screens
  if (theatreId === 't-004') return DEFAULT_SHOWTIMES.filter(t => t !== '10:30 AM');
  if (theatreId === 't-003') return ['11:00 AM', '02:30 PM', '06:15 PM', '10:00 PM'];
  
  // Weekend extra late show
  const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
  if (isWeekend) {
    return [...DEFAULT_SHOWTIMES, '11:55 PM'];
  }
  
  return DEFAULT_SHOWTIMES;
};
