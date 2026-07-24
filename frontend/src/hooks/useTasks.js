import { useState, useEffect } from 'react';
import { fetchTasks } from '../api';

const DEBOUNCE_MS = 300;

export function useTasks(query, status, page, pageSize) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      fetchTasks({ query, status, page, pageSize })
        .then((data) => {
          if (!active) return;
          setTasks(data.items);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((err) => {
          if (!active) return;
          setError(err.message);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [query, status, page, pageSize]);

  return { tasks, total, loading, error };
}
