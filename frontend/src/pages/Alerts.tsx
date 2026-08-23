import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Car, History, Clock } from 'lucide-react';
import { useAlertStore } from '../store/alertStore';

export function Alerts() {
  const { alerts, historyAlerts, loading, historyLoading, acknowledgeAlert, fetchHistory } = useAlertStore();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (activeTab === 'history' && historyAlerts.length === 0) {
      fetchHistory();
    }
  }, [activeTab, fetchHistory, historyAlerts.length]);

  const displayData = activeTab === 'active' ? alerts : historyAlerts;
  const displayLoading = activeTab === 'active' ? loading : historyLoading;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-heading text-brand-void mb-2 uppercase">Alerts & Events</h1>
          <p className="text-muted-foreground font-body">Threshold breaches and system events.</p>
        </div>
        
        {/* Tab Controls */}
        <div className="flex items-center bg-card rounded-lg border border-border p-1">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all text-sm ${
              activeTab === 'active' 
                ? 'bg-brand-core text-white shadow-sm' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Active ({alerts.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all text-sm ${
              activeTab === 'history' 
                ? 'bg-brand-core text-white shadow-sm' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {displayLoading && displayData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-void"></div>
        </div>
      ) : displayData.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center flex flex-col items-center justify-center">
          {activeTab === 'active' ? (
            <>
              <CheckCircle className="w-16 h-16 text-brand-core mb-4" />
              <h2 className="text-2xl font-heading text-foreground uppercase tracking-widest mb-2">All Clear</h2>
              <p className="text-muted-foreground font-body">No active alerts at this time.</p>
            </>
          ) : (
            <>
              <Clock className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-heading text-foreground uppercase tracking-widest mb-2">No History</h2>
              <p className="text-muted-foreground font-body">No acknowledged alerts in your history yet.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 font-body">
          {displayData.map((alert) => (
            <div key={alert.id} className="bg-card rounded-xl border border-border p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-colors hover:border-brand-flame/50">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-full border shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-brand-flame/10 border-brand-flame/20' : 'bg-brand-ember/10 border-brand-ember/20'}`}>
                  <AlertTriangle className={`w-6 h-6 ${alert.severity === 'CRITICAL' ? 'text-brand-flame' : 'text-brand-ember'}`} />
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">{alert.vehicleId}</h3>
                    <span className={`text-white text-xs font-bold px-2 py-1 rounded ${alert.severity === 'CRITICAL' ? 'bg-brand-flame' : 'bg-brand-ember'}`}>
                      {alert.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4 text-brand-core" />
                      <span className="font-semibold text-foreground">{alert.message}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {activeTab === 'active' ? (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="shrink-0 bg-background border border-border-hover hover:bg-brand-core/10 hover:text-brand-core hover:border-brand-core/30 text-foreground font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Acknowledge
                </button>
              ) : (
                <div className="shrink-0 flex items-center gap-2 text-brand-core font-bold px-4">
                  <CheckCircle className="w-5 h-5" />
                  Acknowledged
                </div>
              )}
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
