"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Square,
  Satellite,
  Clock,
  Activity,
  Wifi,
  WifiOff,
  MapPin,
  Zap,
  Database,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

interface GPSData {
  timestamp: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
  altitude?: number;
  heading?: number;
  deviceId?: string;
  [key: string]: unknown; 
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  timestamp?: string;
  [key: string]: unknown; 
}


export default function GPSTrackerDashboard() {
  const [serverStatus, setServerStatus] = useState("stopped");
  const [lastSentData, setLastSentData] = useState<GPSData | null>(null);
  const [lastApiResponse, setLastApiResponse] = useState<ApiResponse | null>(null);
  const [lastResponseTime, setLastResponseTime] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  useEffect(() => {
    axios
      .get("https://sub.velsat.pe:8587/estado")
      .then((res) => {
        const activo = res.data.activo;
        setServerStatus(activo ? "running" : "stopped");
      })
      .catch((err) => {
        console.error("Error al consultar estado:", err);
      });

    const connection = new HubConnectionBuilder()
      .withUrl("https://sub.velsat.pe:8587/retransmisionhub")
      .configureLogging(LogLevel.Information)
      .build();

    connection.on("TramasEnviadas", (message) => {
      try {
        const { timestamp, data } = message;
        setLastSentData({ timestamp, ...data });
      } catch (err) {
        console.error("Error al procesar TramasEnviadas:", err);
      }
    });

    connection.on("RespuestaRecibida", (message) => {
      try {
        const { timestamp, respuesta } = message;
        setLastApiResponse(respuesta);
        setLastResponseTime(timestamp);
      } catch (err) {
        console.error("Error al procesar RespuestaRecibida:", err);
      }
    });

    connection
      .start()
      .then(() => {
        console.log("Conectado a SignalR");
        setConnectionStatus("connected");
      })
      .catch((err) => {
        console.error("Error al conectar al hub:", err);
        setConnectionStatus("error");
      });

    return () => {
      connection.stop();
      setConnectionStatus("disconnected");
    };
  }, []);

  const handleIniciar = async () => {
    try {
      await axios.post("https://sub.velsat.pe:8587/iniciar");
      setServerStatus("running");
    } catch (err) {
      console.error("Error al iniciar servidor:", err);
      alert("❌ Error al iniciar el servidor");
    }
  };

  const handleDetener = async () => {
    try {
      await axios.post("https://sub.velsat.pe:8587/detener");
      setServerStatus("stopped");
    } catch (err) {
      console.error("Error al detener servidor:", err);
      alert("❌ Error al detener el servidor");
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />;
      case "error":
        return <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />;
      default:
        return (
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
        );
    }
  };

  const getStatusIcon = () => {
    return serverStatus === "running" ? (
      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
    ) : (
      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
    );
  };

return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
                <Satellite className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Agente GPS</h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Sistema de envio de datos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ">
              {/* Connection Status */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-700/50 px-2 sm:px-3 py-1 rounded-full">
                {getConnectionIcon()}
                <span className="text-xs sm:text-sm font-medium">
                  {connectionStatus === "connected"
                    ? "Conectado"
                    : connectionStatus === "error"
                    ? "Error"
                    : "Desconectado"}
                </span>
              </div>

              <div className=" flex flex-col justify-center items-center">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-200 via-gray-200 to-blue-200 bg-clip-text text-transparent tracking-wider">
                    VELSAT
                  </h1>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">
                  Sistema GPS Profesional
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 ">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-4">
          <motion.div
            className="bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-600/20 p-1.5 sm:p-2 rounded-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-400">
                  Estado del Servidor
                </p>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="font-semibold text-sm sm:text-base truncate">
                    {serverStatus === "running" ? "En ejecución" : "Detenido"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-green-600/20 p-1.5 sm:p-2 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-400">Último Envío</p>
                <p className="font-semibold text-xs sm:text-sm truncate">
                  {lastSentData?.timestamp
                    ? new Date(lastSentData.timestamp).toLocaleTimeString()
                    : "Esperando..."}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-700 sm:col-span-2 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-purple-600/20 p-1.5 sm:p-2 rounded-lg">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-400">
                  Última Respuesta
                </p>
                <p className="font-semibold text-xs sm:text-sm truncate">
                  {lastResponseTime
                    ? new Date(lastResponseTime).toLocaleTimeString()
                    : "Esperando..."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-4">
          {/* Último envío */}
          <motion.div
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-3 sm:p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-600/20 p-1.5 sm:p-2 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Último Envío
                </h2>
                {serverStatus === "running" && (
                  <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <span className="text-xs text-green-400 hidden sm:inline">
                      Activo
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="bg-gray-900/50 p-3 sm:p-4 rounded-lg max-h-60 sm:max-h-80 overflow-auto">
                <style jsx>{`
                  ::-webkit-scrollbar {
                    width: 4px;
                  }
                  ::-webkit-scrollbar-thumb {
                    background-color: #3b82f6;
                    border-radius: 4px;
                  }
                  ::-webkit-scrollbar-track {
                    background-color: #374151;
                  }
                `}</style>
                <pre className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">
                  {lastSentData
                    ? JSON.stringify(lastSentData, null, 2)
                    : "Esperando datos del GPS..."}
                </pre>
              </div>
            </div>
          </motion.div>

          {/* Última respuesta */}
          <motion.div
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="p-3 sm:p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-green-600/20 p-1.5 sm:p-2 rounded-lg">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Última Respuesta
                </h2>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="bg-gray-900/50 p-3 sm:p-4 rounded-lg max-h-60 sm:max-h-80 overflow-auto">
                <pre className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">
                  {lastApiResponse
                    ? JSON.stringify(lastApiResponse, null, 2)
                    : "Esperando respuesta del servidor..."}
                </pre>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Data Flow Visualization */}
        <motion.div
          className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 px-4 py-4 mb-6 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-0 ">
            <div className="bg-purple-600/20 p-1.5 sm:p-2 rounded-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold">
              Flujo de Datos
            </h2>
          </div>

          {/* Mobile Flow - Vertical */}
          <div className="flex flex-col items-center gap-4 py-2 sm:hidden">
            {/* GPS Device */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-600/20 p-3 rounded-full mb-2">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400 text-center">
                Dispositivo GPS
              </span>
            </div>

            {/* Arrow Down */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500 to-green-500 relative">
                {serverStatus === "running" && (
                  <motion.div
                    className="absolute w-2 h-2 bg-white rounded-full -left-0.75"
                    animate={{ y: [0, 44] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                  />
                )}
              </div>
              <div className="rotate-90">
                <ArrowRight className="w-4 h-4 text-green-500" />
              </div>
            </div>

            {/* Server */}
            <div className="flex flex-col items-center">
              <div className="bg-green-600/20 p-3 rounded-full mb-2">
                <Satellite className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs text-gray-400 text-center">
                Servidor
              </span>
            </div>

            {/* Arrow Down */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-12 bg-gradient-to-b from-green-500 to-purple-500 relative">
                {serverStatus === "running" && (
                  <motion.div
                    className="absolute w-2 h-2 bg-white rounded-full -left-0.75"
                    animate={{ y: [0, 44] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                      delay: 1,
                    }}
                  />
                )}
              </div>
              <div className="rotate-90">
                <ArrowRight className="w-4 h-4 text-purple-500" />
              </div>
            </div>

            {/* API */}
            <div className="flex flex-col items-center">
              <div className="bg-purple-600/20 p-3 rounded-full mb-2">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs text-gray-400 text-center">
                API GOLDCAR
              </span>
            </div>
          </div>

          {/* Desktop Flow - Horizontal */}
          <div className="hidden sm:flex items-center justify-center gap-6 lg:gap-8 py-0 ">
            {/* GPS Device */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-600/20 p-4 rounded-full mb-2">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Dispositivo GPS</span>
            </div>

            {/* Arrow 1 */}
            <div className="flex items-center">
              <div className="h-0.5 w-12 lg:w-16 bg-gradient-to-r from-blue-500 to-green-500 relative">
                {serverStatus === "running" && (
                  <motion.div
                    className="absolute w-2 h-2 bg-white rounded-full -top-0.75 -left-1"
                    animate={{ x: [0, 48] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                  />
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-green-500 ml-1" />
            </div>

            {/* Server */}
            <div className="flex flex-col items-center">
              <div className="bg-green-600/20 p-4 rounded-full mb-2">
                <Satellite className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Servidor</span>
            </div>

            {/* Arrow 2 */}
            <div className="flex items-center">
              <div className="h-0.5 w-12 lg:w-16 bg-gradient-to-r from-green-500 to-purple-500 relative">
                {serverStatus === "running" && (
                  <motion.div
                    className="absolute w-2 h-2 bg-white rounded-full -top-0.75 -left-1"
                    animate={{ x: [0, 48] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                      delay: 1,
                    }}
                  />
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-purple-500 ml-1" />
            </div>

            {/* API */}
            <div className="flex flex-col items-center">
              <div className="bg-purple-600/20 p-4 rounded-full mb-2">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">API GOLDCAR</span>
            </div>
          </div>
        </motion.div>

        {/* Control Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
              serverStatus === "running"
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/25"
            }`}
            disabled={serverStatus === "running"}
            onClick={handleIniciar}
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            Iniciar Servidor
          </button>

          <button
            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
              serverStatus === "stopped"
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg hover:shadow-red-500/25"
            }`}
            disabled={serverStatus === "stopped"}
            onClick={handleDetener}
          >
            <Square className="w-4 h-4 sm:w-5 sm:h-5" />
            Detener Servidor
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 mt-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo/Brand Section */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-200 via-gray-200 to-purple-200 bg-clip-text text-transparent">
                  VELSAT GPS
                </h3>
                <p className="text-xs text-gray-400">Desarrollado por IDEATEC</p>
              </div>
            </div>

            {/* Status Information */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center md:text-right">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sistema de envio de datos en tiempo real</span>
              </div>
              <div className="text-xs text-gray-400">
                Versión 1.0.0 | © 2025 VELSAT
              </div>
            </div>
          </div>

   
        </div>
      </motion.footer>
    </div>
  );
}
