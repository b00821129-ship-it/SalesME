import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

export default function ActivityChart({ callLogs }) {
  // Group calls by day for the last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const day = moment().subtract(i, 'days');
    const dayStr = day.format('YYYY-MM-DD');
    const count = callLogs.filter(log => moment(log.created_date).format('YYYY-MM-DD') === dayStr).length;
    days.push({ day: day.format('ddd'), calls: count });
  }

  return (
    <div className="rounded-2xl p-5 theme-transition" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
      <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Call Volume (7 Days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={days}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
          <Bar dataKey="calls" fill="#CE6969" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
