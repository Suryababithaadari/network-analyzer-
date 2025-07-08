import React from 'react';
import { X, Download, Clock, Activity, ArrowUpDown } from 'lucide-react';
import { Session } from '../types';

interface SessionDetailsProps {
  session: Session;
  onClose: () => void;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ session, onClose }) => {
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getProtocolColor = (protocol: string) => {
    const colors = {
      'TCP': 'bg-blue-500',
      'UDP': 'bg-green-500',
      'ICMP': 'bg-yellow-500',
      'HTTP': 'bg-purple-500',
      'HTTPS': 'bg-indigo-500',
      'DNS': 'bg-orange-500'
    };
    return colors[protocol as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Session Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Overview */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Session Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getProtocolColor(session.protocol)}`}>
                  {session.protocol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Source:</span>
                <span className="text-white">{session.src_ip}:{session.src_port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Destination:</span>
                <span className="text-white">{session.dst_ip}:{session.dst_port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Start Time:</span>
                <span className="text-white">{formatTimestamp(session.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End Time:</span>
                <span className="text-white">{formatTimestamp(session.end_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{formatDuration(session.duration)}</span>
              </div>
            </div>
          </div>

          {/* Data Statistics */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ArrowUpDown className="h-5 w-5 mr-2" />
              Data Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Packets:</span>
                <span className="text-white">{session.packet_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bytes Sent:</span>
                <span className="text-white">{formatBytes(session.bytes_sent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bytes Received:</span>
                <span className="text-white">{formatBytes(session.bytes_received)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Data:</span>
                <span className="text-white">{formatBytes(session.bytes_sent + session.bytes_received)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Throughput:</span>
                <span className="text-white">
                  {session.duration > 0 
                    ? formatBytes((session.bytes_sent + session.bytes_received) / session.duration) + '/s'
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* File Information */}
        <div className="bg-gray-700 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            File Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Source File:</span>
              <span className="text-white">{session.filename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Session ID:</span>
              <span className="text-white font-mono text-sm">{session.id}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.open(`http://localhost:3001/api/download/file/${session.file_id}`, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download PCAP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;