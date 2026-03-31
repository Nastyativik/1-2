import { Car } from '../types/Car';

export class CarService {
    private cars: Car[] = [];
    private nextId: number = 1;

    createCar(manufacturer: string, model: string, year: number, condition: 'new' | 'used', price: number): Car {
        const car: Car = {
            id: this.nextId++,
            manufacturer,
            model,
            year,
            condition,
            price
        };
        this.cars.push(car);
        console.log(` Автомобиль добавлен: ${car.manufacturer} ${car.model} (ID: ${car.id})`+ '\n');
        return car;
    }

    getAllCars(): Car[] {
        return this.cars;
    }

    getCarById(id: number): Car | undefined {
        return this.cars.find(car => car.id === id);
    }

    updateCar(id: number, updates: Partial<Car>): Car | null {
        const carIndex = this.cars.findIndex(car => car.id === id);

        if (carIndex === -1) {
            console.log(` Автомобиль с ID ${id} не найден`+ '\n');
            return null;
        }

        this.cars[carIndex] = { ...this.cars[carIndex], ...updates, id };
        console.log(` Автомобиль ID ${id} обновлен`+ '\n');
        return this.cars[carIndex];
    }

    deleteCar(id: number): boolean {
        const carIndex = this.cars.findIndex(car => car.id === id);

        if (carIndex === -1) {
            console.log(` Автомобиль с ID ${id} не найден`+ '\n');
            return false;
        }

        this.cars.splice(carIndex, 1);
        console.log(` Автомобиль ID ${id} удален`+ '\n');
        return true;
    }

    displayAllCars(): void {
        if (this.cars.length === 0) {
            console.log('\n Каталог пуст'+ '\n');
            return;
        }

        console.log('\n Каталог автомобилей:'+ '\n');
        console.log('='.repeat(100));
        console.log(
            'ID'.padEnd(5),
            'Производитель'.padEnd(20),
            'Модель'.padEnd(20),
            'Год'.padEnd(6),
            'Состояние'.padEnd(10),
            'Цена ($)'.padEnd(10)
        );
        console.log('='.repeat(100));

        this.cars.forEach(car => {
            console.log(
                String(car.id).padEnd(5),
                car.manufacturer.padEnd(20),
                car.model.padEnd(20),
                String(car.year).padEnd(6),
                (car.condition === 'new' ? 'Новый' : 'Б/У').padEnd(10),
                String(car.price).padEnd(10)
            );
        });
        console.log('='.repeat(100));
        console.log(`Всего автомобилей: ${this.cars.length}\n`);
    }
}