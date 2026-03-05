"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRole } from "@/hooks/use-role";
import { Skeleton } from "@/components/ui/skeleton";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import { MonthYearPicker } from "@/components/calendar/MonthYearPicker";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { isAdmin, loading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const fetchRef = React.useRef("");

  useEffect(() => {
    const fetchKey = `${currentDate.toISOString()}-${user?.id}-${isAdmin}`;
    if (!authLoading && !roleLoading && user && fetchRef.current !== fetchKey) {
      fetchRef.current = fetchKey;
      fetchData();
    }
  }, [currentDate, user, authLoading, isAdmin, roleLoading]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Tasks
      let tasksQuery = supabaseBrowser
        .from("tasks")
        .select(`
          id, title, description, status, priority, due_date, project_id,
          created_at, updated_at,
          projects ( title ),
          profiles:assigned_to ( username, avatar_url )
        `);

      if (!isAdmin) {
        tasksQuery = tasksQuery.eq("assigned_to", user.id);
      }

      // 2. Fetch Projects (for deadlines)
      let projectsQuery = supabaseBrowser
        .from("projects")
        .select("id, title, end_date, status, priority");

      if (!isAdmin) {
        const { data: memberProjects } = await supabaseBrowser
          .from("project_members")
          .select("project_id")
          .eq("user_id", user.id);
        
        const projectIds = memberProjects?.map(m => m.project_id) || [];
        if (projectIds.length > 0) {
          projectsQuery = projectsQuery.in("id", projectIds);
        } else {
          // If no projects, return empty (using an impossible UUID)
          projectsQuery = projectsQuery.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      }

      const [tasksRes, projectsRes] = await Promise.all([
        tasksQuery,
        projectsQuery
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error("Error fetching data for calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
  };

  const handleYearSelect = (yearValue: number) => {
    setCurrentDate(new Date(yearValue, currentDate.getMonth(), 1));
  };
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const unscheduledTasks = tasks.filter(t => !t.due_date);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Task Calendar</h1>
          <p className="text-sm md:text-slate-600 mt-1">
            {isAdmin ? "Oversee all project deadlines" : "Stay on top of your deadlines"}
          </p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            disabled={loading || roleLoading}
            onClick={goToToday}
            className="px-3 py-2 md:px-4 md:py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors font-bold text-xs md:text-sm shadow-sm disabled:opacity-50"
          >
            Today
          </button>
          <div className="flex items-center gap-1 md:gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              disabled={loading || roleLoading}
              onClick={prevMonth} 
              className="p-1.5 md:p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <MonthYearPicker 
              currentDate={currentDate}
              onMonthSelect={handleMonthSelect}
              onYearSelect={handleYearSelect}
            />
            <button 
              disabled={loading || roleLoading}
              onClick={nextMonth} 
              className="p-1.5 md:p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Main Container */}
        <div className="lg:col-span-3 lg:flex lg:flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[400px]">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 md:py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.2em]">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-grow">
              {loading || roleLoading ? (
                [...Array(35)].map((_, i) => <CalendarDaySkeleton key={i} />)
              ) : (
                days.map((day, index) => {
                  const dateStr = day ? `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                  const dayTasks = dateStr ? tasks.filter(t => t.due_date?.startsWith(dateStr)) : [];
                  const dayProjects = dateStr ? projects.filter(p => p.end_date?.startsWith(dateStr)) : [];
                  const isToday = day && new Date().toDateString() === new Date(year, currentDate.getMonth(), day).toDateString();
                  const isSelected = day === selectedDay;

                  return (
                    <div 
                      key={index} 
                      onClick={() => day && setSelectedDay(day)}
                      className={`min-h-[80px] md:min-h-[140px] p-1 md:p-2 border-r border-b border-slate-50 last:border-r-0 relative group transition-colors cursor-pointer
                        ${!day ? 'bg-slate-25/50' : isSelected ? 'bg-teal-50/40 shadow-[inset_0_0_0_2px_#14b8a6]' : 'hover:bg-slate-50/20'}
                      `}
                    >
                      {day && (
                        <>
                          <span className={`text-[10px] md:text-sm font-bold absolute top-1.5 left-1.5 md:top-3 md:left-3 ${isToday ? 'bg-teal-500 text-white w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full shadow-lg shadow-teal-500/30' : 'text-slate-400'}`}>
                            {day}
                          </span>
                          <div className="mt-5 md:mt-8">
                            <div className="flex flex-wrap gap-0.5 md:hidden justify-center items-center mt-2">
                              {dayProjects.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                              {dayTasks.map(t => (
                                <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-green-400' : t.priority === 'urgent' || t.priority === 'high' ? 'bg-red-400' : 'bg-blue-400'}`} />
                              ))}
                            </div>
                            <div className="hidden md:block space-y-1">
                              {dayProjects.map(project => (
                                <div key={`proj-${project.id}`} className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5 shadow-md">
                                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
                                  <span className="truncate">Proj: {project.title}</span>
                                </div>
                              ))}
                              {dayTasks.map(task => (
                                <button 
                                  key={task.id} 
                                  onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setIsModalOpen(true); }}
                                  className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-bold truncate transition-all active:scale-[0.98] border shadow-sm ${task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
                                >
                                  <div className="flex items-center gap-1">
                                    {task.status === 'completed' && <svg className="w-2 h-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                                    <span className="truncate">{task.title}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          {/* Assignments list for mobile */}
          {selectedDay && (
            <div className="md:hidden p-4 bg-slate-50 border-t border-slate-100 animate-fade-in space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignments for {selectedDay} {monthName}</h3>
              <div className="space-y-2">
                {projects.filter(p => p.end_date?.startsWith(`${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)).map(project => (
                  <div key={`mobile-proj-${project.id}`} className="p-4 rounded-xl bg-slate-900 text-white shadow-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"></div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">Project Deadline</span>
                    </div>
                    <p className="font-bold text-sm tracking-tight">{project.title}</p>
                  </div>
                ))}
                {tasks.filter(t => t.due_date?.startsWith(`${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)).map(task => (
                  <button key={`mobile-task-${task.id}`} onClick={() => { setSelectedTask(task); setIsModalOpen(true); }} className="w-full text-left p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 transition-all flex items-center justify-between group">
                    <div className="min-w-0 pr-4">
                      <p className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors truncate text-sm tracking-tight">{task.title}</p>
                      <p className="text-[8px] text-slate-400 uppercase font-black mt-0.5 truncate">{task.projects?.title || "No Project"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`shrink-0 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wide ${task.status === 'completed' ? 'bg-green-100 text-green-700' : task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {task.status}
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                ))}
                {tasks.filter(t => t.due_date?.startsWith(`${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)).length === 0 && projects.filter(p => p.end_date?.startsWith(`${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)).length === 0 && (
                  <div className="py-10 text-center bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest" >No assignments scheduled</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6" >
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Unscheduled
            </h2>
            {loading || roleLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <UnscheduledTaskSkeleton key={i} />)}
              </div>
            ) : unscheduledTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic" >Efficiency 100%</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {unscheduledTasks.map(task => (
                  <button key={task.id} onClick={() => { setSelectedTask(task); setIsModalOpen(true); }} className="w-full text-left p-4 rounded-xl bg-white border border-slate-100 hover:border-teal-200 shadow-sm transition-all group">
                    <p className="text-xs font-bold text-slate-700 truncate group-hover:text-teal-600">{task.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black truncate">{task.projects?.title || "No Project"}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                        {task.priority}
                      </span>
                      <span className="text-[8px] font-black text-teal-500 group-hover:underline">Schedule →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic" >Tip: Assign due dates to visualize your high-performance schedule.</p>
            </div>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          isAdmin={isAdmin}
          projectId={selectedTask.project_id}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}

function CalendarDaySkeleton() {
  return (
    <div className="min-h-[80px] md:min-h-[140px] p-2 border-r border-b border-slate-50 last:border-r-0 relative bg-white">
      <Skeleton className="h-4 w-4 md:h-7 md:w-7 rounded-full absolute top-2 left-2 md:top-3 md:left-3" />
      <div className="mt-8 space-y-1 hidden md:block">
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-4/5 rounded-lg" />
      </div>
    </div>
  );
}

function UnscheduledTaskSkeleton() {
  return (
    <div className="w-full text-left p-4 rounded-xl bg-white border border-slate-100 shadow-sm space-y-2">
      <Skeleton className="h-3 w-3/4 rounded-md" />
      <Skeleton className="h-2 w-1/2 rounded-md" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-2 w-8 rounded-md" />
        <Skeleton className="h-2 w-16 rounded-md" />
      </div>
    </div>
  );
}
