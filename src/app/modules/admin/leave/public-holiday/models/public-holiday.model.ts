export interface HolidayResponse {
    id: number;
    name: string;
    holidayDate: string;
  }
  
  export interface CreateHolidayRequest {
    name: string;
    holidayDate: string;
  }
  
  export interface UpdateHolidayRequest {
    name: string;
    holidayDate: string;
  }