import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllTeachers, updateTimetable } from '../../services/authService';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const SLOT_TIMES = {
  1: '8:50 - 9:40', 2: '9:40 - 10:30', 3: '10:30 - 11:20', 4: '11:20 - 12:10',
  5: '12:50 - 1:30', 6: '1:30 - 2:10', 7: '2:10 - 2:50', 8: '2:50 - 3:30'
};

export default function ManageTimetable() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(null); // { day, slot }
  const [editSubject, setEditSubject] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('teacher'); // teacher | overview
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadJson, setUploadJson] = useState('');

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      const t = await getAllTeachers();
      setTeachers(t);
      if (t.length > 0) {
        selectTeacher(t[0]);
      }
    } catch (err) {
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const selectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setTimetable(JSON.parse(JSON.stringify(teacher.timetable || {
      monday: [], tuesday: [], wednesday: [],
      thursday: [], friday: []
    })));
    setSuccess('');
    setError('');
  };

  const openEditModal = (day, slotNum) => {
    const existing = timetable[day]?.find(s => s.slot === slotNum);
    setEditSubject(existing ? existing.subject : '');
    setEditModal({ day, slot: slotNum });
  };

  const saveSlot = () => {
    if (!editModal) return;
    const { day, slot } = editModal;
    const newTimetable = { ...timetable };

    if (editSubject.trim()) {
      // Add or update
      const existing = newTimetable[day].findIndex(s => s.slot === slot);
      if (existing >= 0) {
        newTimetable[day][existing] = { slot, subject: editSubject.trim() };
      } else {
        newTimetable[day] = [...newTimetable[day], { slot, subject: editSubject.trim() }].sort((a, b) => a.slot - b.slot);
      }
    } else {
      // Remove
      newTimetable[day] = newTimetable[day].filter(s => s.slot !== slot);
    }

    setTimetable(newTimetable);
    setEditModal(null);
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateTimetable(selectedTeacher._id, timetable);
      setSuccess(`Timetable saved for ${selectedTeacher.name}!`);
      // Refresh
      const updated = await getAllTeachers();
      setTeachers(updated);
      const refreshed = updated.find(t => t._id === selectedTeacher._id);
      if (refreshed) setSelectedTeacher(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Count total lectures for a teacher
  const lectureCount = (tt) => Object.values(tt || {}).flat().length;
  const freeSlotCount = (tt) => 48 - lectureCount(tt); // 8 slots × 6 days = 48

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading timetables...</p>
        </div>
      </div>
    );
  }


  const handleUpload = () => {
    try {
      const parsed = JSON.parse(uploadJson);
      // Basic validation
      const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of requiredDays) {
        if (!Array.isArray(parsed[day])) {
          throw new Error(`Missing or invalid array for ${day}`);
        }
      }
      setTimetable(parsed);
      setSuccess('Timetable imported! Click "Save Changes" to commit.');
      setShowUploadModal(false);
      setUploadJson('');
    } catch (err) {
      alert(`Invalid JSON format: ${err.message}`);
    }
  };

  const copyCurrentJson = () => {
    navigator.clipboard.writeText(JSON.stringify(timetable, null, 2));
    alert('Timetable JSON copied to clipboard!');
  };

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title">Manage Timetable</h1>
        <p className="page-subtitle">View and edit teacher timetables — click any cell to add or edit a lecture</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }} className="animate-in">
        <button className={`btn btn-sm ${viewMode === 'teacher' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setViewMode('teacher')} style={{ borderRadius: '20px', background: viewMode === 'teacher' ? '' : 'white' }}>
          👤 Per Teacher
        </button>
        <button className={`btn btn-sm ${viewMode === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setViewMode('overview')} style={{ borderRadius: '20px', background: viewMode === 'overview' ? '' : 'white' }}>
          📋 Free Slot Overview
        </button>
      </div>

      {viewMode === 'teacher' ? (
        <>
          {/* Teacher Selector */}
          <div className="animate-in" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {teachers.map(t => (
                <button key={t._id}
                  className={`btn btn-sm ${selectedTeacher?._id === t._id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => selectTeacher(t)}
                  style={{ borderRadius: '20px', background: selectedTeacher?._id === t._id ? '' : 'white' }}>
                  {t.name.split(' ').pop()}
                  <span style={{ opacity: 0.7, marginLeft: '4px' }}>({lectureCount(t.timetable)})</span>
                </button>
              ))}
            </div>
          </div>

          {selectedTeacher && timetable && (
            <div className="card-flat animate-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{selectedTeacher.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {lectureCount(timetable)} lectures · {freeSlotCount(timetable)} free slots
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-outline" onClick={() => {
                    setUploadJson(JSON.stringify(timetable, null, 2));
                    setShowUploadModal(true);
                  }}>
                    📤 Bulk Upload
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="spinner"></span> : '💾 Save Changes'}
                  </button>
                </div>
              </div>

              {/* Timetable Grid */}
              <div className="admin-timetable-grid">
                <div className="tt-header-cell"></div>
                {[1,2,3,4].map(slotNum => (
                  <div key={slotNum} className="tt-header-cell">
                    Lec {slotNum} <span style={{display:'block', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'normal'}}>{SLOT_TIMES[slotNum]}</span>
                  </div>
                ))}
                <div className="tt-header-cell break" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span>Break</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>12:10 - 12:50</span>
                </div>
                {[5,6,7,8].map(slotNum => (
                  <div key={slotNum} className="tt-header-cell">
                    Lec {slotNum} <span style={{display:'block', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'normal'}}>{SLOT_TIMES[slotNum]}</span>
                  </div>
                ))}

                {DAYS.map((day, rowIndex) => (
                  <div key={day} className="tt-row-fragment">
                    <div className="tt-slot-label">
                      <strong>{day.charAt(0).toUpperCase() + day.slice(1, 3)}</strong>
                    </div>
                    {[1,2,3,4].map(slotNum => {
                      const lecture = timetable[day]?.find(s => s.slot === slotNum);
                      return (
                        <div key={slotNum}
                          className={`tt-cell ${lecture ? 'has-lecture' : 'free'}`}
                          onClick={() => openEditModal(day, slotNum)}
                          title={lecture ? `${lecture.subject} — Click to edit` : 'Free — Click to add'}>
                          {lecture ? (
                            <span className="tt-subject">{lecture.subject}</span>
                          ) : (
                            <span className="tt-free">FREE</span>
                          )}
                        </div>
                      );
                    })}
                    <div className="tt-cell" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                      {['B', 'R', 'E', 'A', 'K', ''][rowIndex] || ''}
                    </div>
                    {[5,6,7,8].map(slotNum => {
                      const lecture = timetable[day]?.find(s => s.slot === slotNum);
                      return (
                        <div key={slotNum}
                          className={`tt-cell ${lecture ? 'has-lecture' : 'free'}`}
                          onClick={() => openEditModal(day, slotNum)}
                          title={lecture ? `${lecture.subject} — Click to edit` : 'Free — Click to add'}>
                          {lecture ? (
                            <span className="tt-subject">{lecture.subject}</span>
                          ) : (
                            <span className="tt-free">FREE</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Overview Mode - Free slots for all teachers */
        <div className="card-flat animate-in">
          <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.5rem' }}>
            Free Slot Overview — All Teachers
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Numbers show how many teachers are free for each slot. Click to see names.
          </p>

          <div className="admin-timetable-grid">
            <div className="tt-header-cell"></div>
            {[1,2,3,4].map(slotNum => (
              <div key={slotNum} className="tt-header-cell">
                Lec {slotNum} <span style={{display:'block', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'normal'}}>{SLOT_TIMES[slotNum]}</span>
              </div>
            ))}
            <div className="tt-header-cell break" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span>Break</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>12:10 - 12:50</span>
            </div>
            {[5,6,7,8].map(slotNum => (
              <div key={slotNum} className="tt-header-cell">
                Lec {slotNum} <span style={{display:'block', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'normal'}}>{SLOT_TIMES[slotNum]}</span>
              </div>
            ))}

            {DAYS.map((day, rowIndex) => (
              <div key={day} className="tt-row-fragment">
                <div className="tt-slot-label">
                  <strong>{day.charAt(0).toUpperCase() + day.slice(1, 3)}</strong>
                </div>
                {[1,2,3,4].map(slotNum => {
                  const freeTeachers = teachers.filter(t => {
                    const daySchedule = t.timetable?.[day] || [];
                    return !daySchedule.some(s => s.slot === slotNum);
                  });
                  return (
                    <div key={slotNum}
                      className="tt-cell overview" style={{ padding: '4px', minHeight: '60px', alignItems: 'center', justifyContent: 'center' }}
                      title={freeTeachers.map(t => t.name).join(', ') || 'No one free'}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', width: '100%' }}>
                        {freeTeachers.map(t => (
                          <span key={t._id} style={{ fontSize: '0.65rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '1px 4px', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {t.name.split(' ')[0]} {t.name.split(' ')[1]}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="tt-cell" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                  {['B', 'R', 'E', 'A', 'K', ''][rowIndex] || ''}
                </div>
                {[5,6,7,8].map(slotNum => {
                  const freeTeachers = teachers.filter(t => {
                    const daySchedule = t.timetable?.[day] || [];
                    return !daySchedule.some(s => s.slot === slotNum);
                  });
                  return (
                    <div key={slotNum}
                      className="tt-cell overview" style={{ padding: '4px', minHeight: '60px', alignItems: 'center', justifyContent: 'center' }}
                      title={freeTeachers.map(t => t.name).join(', ') || 'No one free'}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', width: '100%' }}>
                        {freeTeachers.map(t => (
                          <span key={t._id} style={{ fontSize: '0.65rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '1px 4px', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {t.name.split(' ')[0]} {t.name.split(' ')[1]}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)' }}></div>
              4+ free (good)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.15)' }}></div>
              2-3 free (ok)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.15)' }}></div>
              0-1 free (tight)
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>
              {editModal.day.charAt(0).toUpperCase() + editModal.day.slice(1)} — Slot {editModal.slot}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                ({SLOT_TIMES[editModal.slot]})
              </span>
            </h3>
            <div className="form-group">
              <label className="form-label">Subject Name</label>
              <input type="text" className="form-input" placeholder="Leave empty to mark as FREE"
                value={editSubject} onChange={e => setEditSubject(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveSlot()}
                autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              {editSubject.trim() === '' && timetable[editModal.day]?.find(s => s.slot === editModal.slot) && (
                <button className="btn btn-danger" onClick={saveSlot}>Remove Lecture</button>
              )}
              <button className="btn btn-primary" onClick={saveSlot}>
                {editSubject.trim() ? 'Save' : 'Mark as Free'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Bulk Timetable Upload</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Paste a JSON array of daily slots to set the entire timetable at once.
            </p>
            <div className="form-group">
              <textarea 
                className="form-textarea" 
                style={{ height: '300px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                value={uploadJson}
                onChange={e => setUploadJson(e.target.value)}
                placeholder='{ "monday": [ { "slot": 1, "subject": "DSA" } ], ... }'
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={copyCurrentJson}>Copy Current JSON</button>
              <div style={{ flex: 1 }}></div>
              <button className="btn btn-outline" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpload}>Apply JSON</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

