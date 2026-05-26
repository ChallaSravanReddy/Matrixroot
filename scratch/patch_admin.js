const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// ─── 1. Remove file upload + task checklist from course create form ───────────
// Replace the block from the file upload comment up to the old submit button
const removeStart = `\n                    {/* Problem Statement File Upload */}\n                     <div className="space-y-1">\n                       <label className="text-[10px] font-medium text-[#3D2B1F]/60 flex items-center gap-1">\n                         Workspace Document (PDF/DOCX)\n                       </label>`;
const oldSubmit = `<Button type="submit" className="w-full h-10 rounded-[12px] font-medium text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none mt-2">Commit Record</Button>`;
const newSubmit = `<Button type="submit" className="w-full h-10 rounded-[12px] font-medium text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none mt-2">Add Course</Button>`;

if (content.includes(removeStart)) {
  // Find the index of the block start
  const startIdx = content.indexOf(removeStart);
  // Find the old submit button after that index
  const submitIdx = content.indexOf(oldSubmit, startIdx);
  if (submitIdx !== -1) {
    // Remove everything from removeStart up to (but not including) the old submit button
    content = content.substring(0, startIdx) + '\n' + ' '.repeat(20) + content.substring(submitIdx);
    console.log('✓ Removed file upload + task checklist from create form');
  } else {
    console.log('✗ Could not find old submit button');
  }
} else {
  console.log('✗ File upload block not found - may already be removed');
}

// Replace "Commit Record" button text with "Add Course"
content = content.replace(
  '>Commit Record</Button>',
  '>Add Course</Button>'
);
console.log('✓ Renamed submit button to "Add Course"');

// ─── 2. Update course selector in lessons tab to populate tasks state ─────────
const oldSelector = `                  onChange={(e) => {
                    setSelectedCourseFilter(e.target.value);
                    setNewModule({ ...newModule, course_id: e.target.value });
                    setNewLesson({ ...newLesson, course_id: e.target.value, module_id: "" });
                  }}`;

const newSelector = `                  onChange={(e) => {
                    const cId = e.target.value;
                    setSelectedCourseFilter(cId);
                    setNewModule({ ...newModule, course_id: cId });
                    setNewLesson({ ...newLesson, course_id: cId, module_id: "" });
                    // Populate side panel tasks when a course is chosen
                    const co = courses.find((c) => String(c.id) === String(cId));
                    if (co) {
                      setCourseMainTasks(co.project_tasks?.length ? co.project_tasks : [""]);
                      const weeks = co.timeline_weeks || 8;
                      const existing = co.weekly_tasks || [];
                      setCourseWeeklyTasks(Array.from({ length: weeks }, (_, i) => existing[i] || ""));
                    } else {
                      setCourseMainTasks([""]);
                      setCourseWeeklyTasks([]);
                    }
                  }}`;

if (content.includes(oldSelector)) {
  content = content.replace(oldSelector, newSelector);
  console.log('✓ Updated course selector to populate tasks state');
} else {
  console.log('✗ Course selector pattern not found');
}

// ─── 3. After curriculum structure block, add Internship Tasks side panel ──────
// We inject a tasks side panel right before the closing of the selectedCourseFilter block
// The closing sequence is: </div>\n\n                </div>\n              )}\n            </div>\n          )}\n
// which appears right at end of curriculum structure. We'll insert before the last closing </div> of the
// "space-y-8" selectedCourseFilter block.

const curriculumEndMarker = `                </div>\n\n                </div>\n              )}\n            </div>\n          )}`;

const tasksPanelInsertion = `                </div>

                  {/* ── Internship Tasks Manager ── */}
                  <div className="bg-white border border-[#8B4513]/20 rounded-[14px] p-6 space-y-6 h-fit">
                    <div className="border-b border-[#8B4513]/10 pb-3">
                      <h3 className="text-sm font-bold text-[#3D2B1F]">Internship Tasks</h3>
                      <p className="text-[10px] text-[#3D2B1F]/50 mt-0.5">Configure tasks students must complete</p>
                    </div>

                    <form onSubmit={handleSaveCourseTasks} className="space-y-6">
                      {/* Main Tasks */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-[#8B4513] uppercase tracking-wider">Main Tasks</label>
                          <button type="button"
                            onClick={() => setCourseMainTasks([...courseMainTasks, ""])}
                            className="text-[10px] font-bold text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/15 px-2 py-0.5 rounded-[6px] hover:bg-[#8B4513]/10 transition-all"
                          >+ Add</button>
                        </div>
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                          {courseMainTasks.map((task, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-[#F9F5F0]/50 px-2.5 py-2 rounded-[8px] border border-[#8B4513]/10">
                              <span className="text-[9px] font-bold text-[#8B4513]/60 w-4 text-center shrink-0">{idx + 1}</span>
                              <input type="text" value={task}
                                onChange={(e) => { const u = [...courseMainTasks]; u[idx] = e.target.value; setCourseMainTasks(u); }}
                                placeholder={\`Main task \${idx + 1}...\`}
                                className="flex-1 bg-transparent border-0 text-xs text-[#3D2B1F] focus:outline-none placeholder-[#3D2B1F]/30 font-medium"
                              />
                              {courseMainTasks.length > 1 && (
                                <button type="button"
                                  onClick={() => setCourseMainTasks(courseMainTasks.filter((_, i) => i !== idx))}
                                  className="text-red-400 hover:text-red-600 p-0.5 rounded transition-all shrink-0"
                                ><Trash2 size={11} /></button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Weekly Tasks */}
                      <div className="space-y-3 border-t border-[#8B4513]/10 pt-4">
                        <label className="text-[10px] font-bold text-[#8B4513] uppercase tracking-wider block">Weekly Tasks</label>
                        <p className="text-[10px] text-[#3D2B1F]/50 -mt-1">One task per week — students submit screenshot proof</p>
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                          {courseWeeklyTasks.map((wt, idx) => (
                            <div key={idx} className="flex gap-2 items-start bg-[#F9F5F0]/50 px-2.5 py-2 rounded-[8px] border border-[#8B4513]/10">
                              <span className="text-[9px] font-bold text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/15 px-1.5 py-0.5 rounded-[4px] shrink-0 mt-0.5">W{idx + 1}</span>
                              <input type="text" value={wt}
                                onChange={(e) => { const u = [...courseWeeklyTasks]; u[idx] = e.target.value; setCourseWeeklyTasks(u); }}
                                placeholder={\`Week \${idx + 1} task...\`}
                                className="flex-1 bg-transparent border-0 text-xs text-[#3D2B1F] focus:outline-none placeholder-[#3D2B1F]/30 font-medium"
                              />
                            </div>
                          ))}
                          {courseWeeklyTasks.length === 0 && (
                            <p className="text-[10px] text-[#3D2B1F]/40 italic text-center py-4">Select a course above to configure weekly tasks</p>
                          )}
                        </div>
                      </div>

                      <Button type="submit" disabled={savingTasks || !selectedCourseFilter}
                        className="w-full h-9 rounded-[10px] font-bold text-xs bg-[#8B4513] text-white hover:bg-[#72360f] shadow-none disabled:opacity-50"
                      >
                        {savingTasks ? "Saving..." : "Save Tasks"}
                      </Button>
                    </form>
                  </div>

                </div>\n              )}\n            </div>\n          )}`;

// The curriculum structure block ends in a specific pattern
// Let's find where the selectedCourseFilter conditional ends in the lessons tab
// We look for the closing pattern of the conditional
const lessonsCurriculumEnd = `                </div>\n\n                </div>\n              )}\n            </div>\n          )}`;

if (content.includes(lessonsCurriculumEnd)) {
  content = content.replace(lessonsCurriculumEnd, tasksPanelInsertion);
  console.log('✓ Added Internship Tasks side panel');
} else {
  // Try alternate pattern
  const alt1 = '                </div>\r\n\r\n                </div>\r\n              )}\r\n            </div>\r\n          )}';
  if (content.includes(alt1)) {
    content = content.replace(alt1, tasksPanelInsertion.replace(/\n/g, '\r\n'));
    console.log('✓ Added Internship Tasks side panel (CRLF)');
  } else {
    console.log('✗ Curriculum end marker not found - logging nearby context');
    // Log some context to help debug
    const idx = content.indexOf('Curriculum Structure');
    if (idx !== -1) {
      console.log('Curriculum Structure found at index:', idx);
      console.log('Context around it (500 chars after):\n', JSON.stringify(content.substring(idx + 500, idx + 1500)));
    }
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\nFile patched and saved.');
