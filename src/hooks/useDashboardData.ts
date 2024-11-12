import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

export interface DashboardData {
  sceneAnalysisCameras: number;
  totalCount: number;
  peopleCount: number;
  vehicleCount: number;
  peakHourPeople: number;
  peakHourVehicle: number;
  objectDetection: {
    cars: number;
    humans: number;
    bikes: number;
    trucks: number;
    buses: number;
  };
  cameraAnalysis: {
    southParking: number;
    parkingExit: number;
  };
  tshirtColors: {
    black: number;
    white: number;
    blue: number;
    red: number;
    gray: number;
    other: number;
  };
}

const DEMO_DATA: DashboardData = {
  sceneAnalysisCameras: 2,
  totalCount: 4900,
  peopleCount: 2,
  vehicleCount: 0,
  peakHourPeople: 259,
  peakHourVehicle: 473,
  objectDetection: {
    cars: 45,
    humans: 30,
    bikes: 15,
    trucks: 7,
    buses: 3
  },
  cameraAnalysis: {
    southParking: 60,
    parkingExit: 40
  },
  tshirtColors: {
    black: 35,
    white: 25,
    blue: 15,
    red: 10,
    gray: 8,
    other: 7
  }
};

export const useDashboardData = () => {
  const { isDemoMode } = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    sceneAnalysisCameras: 0,
    totalCount: 0,
    peopleCount: 0,
    vehicleCount: 0,
    peakHourPeople: 0,
    peakHourVehicle: 0,
    objectDetection: {
      cars: 0,
      humans: 0,
      bikes: 0,
      trucks: 0,
      buses: 0
    },
    cameraAnalysis: {
      southParking: 0,
      parkingExit: 0
    },
    tshirtColors: {
      black: 0,
      white: 0,
      blue: 0,
      red: 0,
      gray: 0,
      other: 0
    }
  });

  useEffect(() => {
    if (isDemoMode) {
      setDashboardData(DEMO_DATA);
    } else {
      // Subscribe to real data sources
      const fetchRealData = async () => {
        try {
          // Replace this with your actual API calls or data fetching logic
          // const response = await fetch('your-api-endpoint');
          // const realData = await response.json();
          // setDashboardData(realData);
          
          // For now, setting to zeros for real mode
          setDashboardData({
            sceneAnalysisCameras: 0,
            totalCount: 0,
            peopleCount: 0,
            vehicleCount: 0,
            peakHourPeople: 0,
            peakHourVehicle: 0,
            objectDetection: {
              cars: 0,
              humans: 0,
              bikes: 0,
              trucks: 0,
              buses: 0
            },
            cameraAnalysis: {
              southParking: 0,
              parkingExit: 0
            },
            tshirtColors: {
              black: 0,
              white: 0,
              blue: 0,
              red: 0,
              gray: 0,
              other: 0
            }
          });
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      };

      fetchRealData();
      
      // Optional: Set up real-time updates
      // const interval = setInterval(fetchRealData, 5000);
      // return () => clearInterval(interval);
    }
  }, [isDemoMode]);

  return dashboardData;
}; 