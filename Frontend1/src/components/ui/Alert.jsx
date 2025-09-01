import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ addAlert, removeAlert }}>
      {children}
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

const AlertContainer = ({ alerts, onRemove }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {alerts.map(alert => (
        <Alert key={alert.id} {...alert} onRemove={() => onRemove(alert.id)} />
      ))}
    </div>
  );
};

const Alert = ({ message, type, onRemove }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          containerClass: 'bg-green-100 border-green-500',
          textClass: 'text-green-800',
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        };
      case 'error':
        return {
          containerClass: 'bg-red-100 border-red-500',
          textClass: 'text-red-800',
          icon: <XCircle className="w-5 h-5 text-red-500" />
        };
      case 'warning':
        return {
          containerClass: 'bg-yellow-100 border-yellow-500',
          textClass: 'text-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />
        };
      default:
        return {
          containerClass: 'bg-blue-100 border-blue-500',
          textClass: 'text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-500" />
        };
    }
  };

  const { containerClass, textClass, icon } = getAlertStyles();

  return (
    <div
      className={`flex items-center p-4 rounded-lg border ${containerClass} shadow-lg min-w-[300px] max-w-[500px] animate-slide-up`}
      role="alert"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className={`ml-3 ${textClass} flex-grow`}>{message}</div>
      <button
        onClick={onRemove}
        className="ml-auto flex-shrink-0 -mr-1 -mt-1"
        aria-label="Close"
      >
        <XCircle className={`w-5 h-5 ${textClass} opacity-75 hover:opacity-100`} />
      </button>
    </div>
  );
};

export default Alert;