import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TASKS } from '../../mocks/initialData';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('forgeflow_tasks');
      if (!saved) return INITIAL_TASKS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  useEffect(() => {
    localStorage.setItem('forgeflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData) => {
    const newTask = {
      id: `task_${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      projectId: taskData.projectId,
      status: taskData.status || 'Todo',
      priority: taskData.priority || 'Medium',
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignee: taskData.assignee || 'Timilehin Oye',
      estimatedHours: Number(taskData.estimatedHours || 0),
      loggedHours: Number(taskData.loggedHours || 0),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id, updatedFields) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t)));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const statusCycle = {
        'Todo': 'In Progress',
        'In Progress': 'In Review',
        'In Review': 'Done',
        'Done': 'Todo'
      };
      return { ...t, status: statusCycle[t.status] || 'Todo' };
    }));
  };

  const getTasksByProjectId = (projectId) => {
    return tasks.filter(t => t.projectId === projectId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        getTasksByProjectId
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
