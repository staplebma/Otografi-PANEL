export const VEHICLE_BRANDS = [
    {
        name: 'Ford',
        models: ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'Puma', 'Ranger', 'Transit']
    },
    {
        name: 'Volkswagen',
        models: ['Passat', 'Golf', 'Polo', 'Tiguan', 'T-Roc', 'Caddy', 'Transporter']
    },
    {
        name: 'Renault',
        models: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Taliant', 'Austral', 'Kangoo']
    },
    {
        name: 'Fiat',
        models: ['Egea', 'Doblo', 'Fiorino', 'Panda', '500', 'Ducato']
    },
    {
        name: 'BMW',
        models: ['1 Serisi', '2 Serisi', '3 Serisi', '4 Serisi', '5 Serisi', 'X1', 'X3', 'X5']
    },
    {
        name: 'Mercedes-Benz',
        models: ['A-Serisi', 'C-Serisi', 'E-Serisi', 'S-Serisi', 'CLA', 'GLA', 'GLC']
    },
    {
        name: 'Audi',
        models: ['A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5']
    },
    {
        name: 'Toyota',
        models: ['Corolla', 'Yaris', 'C-HR', 'RAV4', 'Hilux', 'Proace']
    },
    {
        name: 'Honda',
        models: ['Civic', 'City', 'Jazz', 'CR-V', 'HR-V']
    },
    {
        name: 'Hyundai',
        models: ['i10', 'i20', 'i30', 'Bayon', 'Tucson', 'Elantra']
    },
    {
        name: 'Kia',
        models: ['Picanto', 'Rio', 'Ceed', 'Stonic', 'Sportage', 'Sorento']
    },
    {
        name: 'Peugeot',
        models: ['208', '308', '2008', '3008', '408', '5008', 'Rifter']
    },
    {
        name: 'Citroen',
        models: ['C3', 'C4', 'C5 Aircross', 'C-Elysee', 'Berlingo']
    },
    {
        name: 'Opel',
        models: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'Combo']
    },
    {
        name: 'Nissan',
        models: ['Micra', 'Juke', 'Qashqai', 'X-Trail']
    },
    {
        name: 'Dacia',
        models: ['Sandero', 'Duster', 'Jogger', 'Spring']
    },
    {
        name: 'Skoda',
        models: ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq']
    },
    {
        name: 'Seat',
        models: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco']
    }
].sort((a, b) => a.name.localeCompare(b.name));

export const VEHICLE_YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
