import React, { useState, useEffect } from 'react';
import { Upload, Search, Download, Eye, Activity, Database, FileText, TrendingUp } from 'lucide-react';
import UploadModal from './components/UploadModal';
import SessionTable from './components/SessionTable';
import SessionDetails from './components/SessionDetails';
import StatsCard from './components/StatsCard';
import SearchFilters from './components/SearchFilters';
import { Session, TrafficStats, SearchFilters as SearchFiltersType } from './types';

function App() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    search: '',
    protocol: '',
    startTime: '',
    endTime: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [searchFilters, currentPage]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...searchFilters
      });

      const response = await fetch(`http://localhost:3001/api/sessions?${queryParams}`);
      const data = await response.json();
      setSessions(data.sessions || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSession = (session: Session) => {
    setSelectedSession(session);
    setShowDetails(true);
  };

  const handleSearch = (filters: SearchFiltersType) => {
    setSearchFilters(filters);
    setCurrentPage(1);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchStats();
    fetchSessions();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Network Traffic Analyzer</h1>
              <p className="text-gray-400 text-sm">PCAP Analysis & Session Management</p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload PCAP</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Files"
              value={stats.totalFiles}
              icon={FileText}
              color="blue"
            />
            <StatsCard
              title="Total Sessions"
              value={stats.totalSessions}
              icon={Database}
              color="green"
            />
            <StatsCard
              title="Unique Protocols"
              value={stats.uniqueProtocols}
              icon={TrendingUp}
              color="purple"
            />
            <StatsCard
              title="Active Analysis"
              value={stats.totalFiles > 0 ? 'Running' : 'Idle'}
              icon={Activity}
              color="orange"
              isStatus
            />
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Search & Filter Sessions</h2>
          </div>
          <SearchFilters onSearch={handleSearch} loading={loading} />
        </div>

        {/* Sessions Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Network Sessions</span>
            </h2>
          </div>
          <SessionTable
            sessions={sessions}
            loading={loading}
            onViewSession={handleViewSession}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      {/* Modals */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {showDetails && selectedSession && (
        <SessionDetails
          session={selectedSession}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}

export default App;