import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const SLOT_TIMES = {
  1: '8:50 - 9:40', 2: '9:40 - 10:30', 3: '10:30 - 11:20', 4: '11:20 - 12:10',
  5: '12:50 - 1:30', 6: '1:30 - 2:10', 7: '2:10 - 2:50', 8: '2:50 - 3:30'
};

export default function Profile() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(user?.timetable);

  useEffect(() => {
    if (user?.timetable) {
      setTimetable(user.timetable);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title accent">My Profile</h1>
        <p className="page-subtitle">Your personal details and weekly schedule</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Card */}
        <div className="card-flat animate-in stagger-1" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', background: 'var(--bg-panel)' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gradient-primary)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2.5rem', fontWeight: 800, flexShrink: 0 
          }}>
            {user.name.split('(')[0].trim()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{user.name}</h2>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '1rem' }}>
              <div>📧 <strong>Email:</strong> {user.email}</div>
              <div>🏢 <strong>Department:</strong> {user.department || 'Computer Science'}</div>
              <div>🛡️ <strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
            </div>
          </div>
        </div>

        {/* Timetable Card */}
        <div className="card-flat animate-in stagger-2" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>My Weekly Timetable</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Your busy slots where you host lectures.</p>
          </div>
          
          <div style={{ overflowX: 'auto', padding: '1.5rem' }}>
            <table className="timetable-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '120px', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold' }}>Day / Period</th>
                  {[1,2,3,4].map(slot => (
                    <th key={slot} style={{ padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold' }}>
                      Lec {slot}<br/>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{SLOT_TIMES[slot]}</span>
                    </th>
                  ))}
                  <th style={{ width: '40px', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    BREAK<br/><span style={{fontSize:'0.6rem', fontWeight:'normal', color: 'var(--text-muted)'}}>12:10 - 12:50</span>
                  </th>
                  {[5,6,7,8].map(slot => (
                    <th key={slot} style={{ padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold' }}>
                      Lec {slot}<br/>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{SLOT_TIMES[slot]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, rowIdx) => (
                  <tr key={day}>
                    <td style={{ padding: '1rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}>
                      {day}
                    </td>
                    {[1,2,3,4].map(slot => {
                      const hasClass = timetable?.[day]?.some(s => s.slot === slot);
                      return (
                        <td key={slot} style={{ 
                          padding: '0.75rem', 
                          border: '1px solid var(--border-color)', 
                          textAlign: 'center',
                          background: hasClass ? 'rgba(216, 124, 36, 0.05)' : 'transparent'
                        }}>
                          {hasClass ? (
                            <span style={{ 
                              display: 'inline-block', padding: '0.4rem 0.6rem', 
                              background: 'var(--accent-primary)', color: 'white', 
                              borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 
                            }}>
                              Class
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                          )}
                        </td>
                      );
                    })}

                    {rowIdx === 0 && (
                      <td rowSpan={5} style={{ 
                        padding: '0', 
                        border: '1px solid var(--border-color)', 
                        background: 'var(--bg-input)', 
                        textAlign: 'center', 
                        verticalAlign: 'middle', 
                        fontWeight: 'bold', 
                        letterSpacing: '4px', 
                        fontSize: '0.8rem', 
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: 'auto' }}>BREAK</div>
                      </td>
                    )}

                    {[5,6,7,8].map(slot => {
                      const hasClass = timetable?.[day]?.some(s => s.slot === slot);
                      return (
                        <td key={slot} style={{ 
                          padding: '0.75rem', 
                          border: '1px solid var(--border-color)', 
                          textAlign: 'center',
                          background: hasClass ? 'rgba(216, 124, 36, 0.05)' : 'transparent'
                        }}>
                          {hasClass ? (
                            <span style={{ 
                              display: 'inline-block', padding: '0.4rem 0.6rem', 
                              background: 'var(--accent-primary)', color: 'white', 
                              borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 
                            }}>
                              Class
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
