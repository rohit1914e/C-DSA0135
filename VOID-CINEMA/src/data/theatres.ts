import { Theatre } from '../models/Theatre';

export const THEATRES: Theatre[] = [
  new Theatre('t-001', 'PVR Phoenix Mall', 'Velachery', 4.8, ['IMAX', 'Dolby Atmos', '4K Laser'], 11),
  new Theatre('t-002', 'INOX Marina Mall', 'OMR', 4.5, ['Dolby Atmos', 'Recliners'], 8),
  new Theatre('t-003', 'AGS Villivakkam', 'Villivakkam', 4.3, ['4K Projection', 'Dolby 7.1'], 5),
  new Theatre('t-004', 'SPI Palazzo', 'Vadapalani', 4.9, ['IMAX', 'Dolby Atmos', 'Premium Lounge'], 9),
  new Theatre('t-005', 'Rohini Silver Screens', 'Koyambedu', 4.6, ['EPIQ Format', 'Dolby Atmos', 'Mass Screen'], 7)
];
