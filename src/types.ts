export interface Session {
  id: string;
  file_id: string;
  filename: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  start_time: string;
  end_time: string;
  packet_count: number;
  bytes_sent: number;
  bytes_received: number;
  duration: number;
}

export interface TrafficStats {
  totalFiles: number;
  totalSessions: number;
  uniqueProtocols: number;
  protocolDistribution: Array<{
    protocol: string;
    count: number;
  }>;
}

export interface SearchFilters {
  search: string;
  protocol: string;
  startTime: string;
  endTime: string;
}