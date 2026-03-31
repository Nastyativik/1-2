import inquirer from 'inquirer';
import { CarService } from './services/carservice';
import { Car } from './types/car';

const carService = new CarService();

interface MainMenuAnswers {
    action: string;
}

interface CarInputAnswers {
    manufacturer: string;
    model: string;
    year: number;
    condition: 'new' | 'used';
    price: number;
}

interface CarIdAnswers {
    carId: number;
}

interface ConfirmAnswers {
    continueAdding: boolean;
    confirm: boolean;
}

async function showMainMenu(): Promise<void> {
    const { action }: MainMenuAnswers = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'МЕНЮ: Система управления каталогом автомобилей',
            choices: [
                { name: 'Показать все автомобили', value: 'showAll' },
                { name: 'Добавить автомобиль', value: 'add' },
                { name: 'Обновить автомобиль', value: 'update' },
                { name: 'Удалить автомобиль', value: 'delete' },
                { name: 'Выход', value: 'exit' }
            ],
            pageSize: 6
        }
    ]);

    await handleAction(action);
}

async function handleAction(action: string): Promise<void> {
    switch (action) {
        case 'showAll':
            carService.displayAllCars();
            await showMainMenu();
            break;
        case 'add':
            await addCar();
            break;
        case 'update':
            await updateCar();
            break;
        case 'delete':
            await deleteCar();
            break;
        case 'exit':
            console.log('\nСпасибо за использование системы. До свидания!');
            process.exit(0);
        default:
            console.log('Неверный выбор');
            await showMainMenu();
    }
}

async function addCar(): Promise<void> {
    console.log('\nДОБАВЛЕНИЕ НОВОГО АВТОМОБИЛЯ');

    const answers: CarInputAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'manufacturer',
            message: 'Производитель:',
            validate: (input: string) => {
                if (input.trim().length === 0) {
                    return 'Пожалуйста, введите производителя';
                }
                return true;
            },
            filter: (input: string) => input.trim()
        },
        {
            type: 'input',
            name: 'model',
            message: 'Модель:',
            validate: (input: string) => {
                if (input.trim().length === 0) {
                    return 'Пожалуйста, введите модель';
                }
                return true;
            },
            filter: (input: string) => input.trim()
        },
        {
            type: 'number',
            name: 'year',
            message: 'Год выпуска:',
            validate: (input: number) => {
                const currentYear = new Date().getFullYear();
                if (isNaN(input) || input < 1886 || input > currentYear + 1) {
                    return `Введите корректный год (1886-${currentYear + 1})`;
                }
                return true;
            }
        },
        {
            type: 'list',
            name: 'condition',
            message: 'Состояние:',
            choices: [
                { name: 'Новый', value: 'new' },
                { name: 'Б/У', value: 'used' }
            ]
        },
        {
            type: 'number',
            name: 'price',
            message: 'Цена ($):',
            validate: (input: number) => {
                if (isNaN(input) || input <= 0) {
                    return 'Цена должна быть больше 0';
                }
                return true;
            }
        }
    ]);

    carService.createCar(
        answers.manufacturer,
        answers.model,
        answers.year,
        answers.condition,
        answers.price
    );

    const { continueAdding }: ConfirmAnswers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'continueAdding',
            message: 'Добавить еще один автомобиль?',
            default: false
        }
    ]);

    if (continueAdding) {
        await addCar();
    } else {
        await showMainMenu();
    }
}

async function updateCar(): Promise<void> {
    const cars = carService.getAllCars();

    if (cars.length === 0) {
        console.log('\nКаталог пуст. Сначала добавьте автомобили.');
        await showMainMenu();
        return;
    }

    const { carId }: CarIdAnswers = await inquirer.prompt([
        {
            type: 'list',
            name: 'carId',
            message: 'Выберите автомобиль для обновления:',
            choices: cars.map(car => ({
                name: `ID: ${car.id} - ${car.manufacturer} ${car.model}`,
                value: car.id
            })),
            pageSize: 10
        }
    ]);

    const car = carService.getCarById(carId);
    if (!car) {
        console.log('Автомобиль не найден');
        await showMainMenu();
        return;
    }

    console.log('\nОБНОВЛЕНИЕ АВТОМОБИЛЯ');
    console.log('Оставьте поле пустым, чтобы не изменять');

    const answers: CarInputAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'manufacturer',
            message: `Производитель (${car.manufacturer}):`,
            filter: (input: string) => input.trim() || car.manufacturer
        },
        {
            type: 'input',
            name: 'model',
            message: `Модель (${car.model}):`,
            filter: (input: string) => input.trim() || car.model
        },
        {
            type: 'number',
            name: 'year',
            message: `Год выпуска (${car.year}):`,
            filter: (input: number) => (input && !isNaN(input) ? input : car.year)
        },
        {
            type: 'list',
            name: 'condition',
            message: `Состояние (${car.condition}):`,
            choices: [
                { name: 'Новый', value: 'new' },
                { name: 'Б/У', value: 'used' },
                { name: `Оставить: ${car.condition === 'new' ? 'Новый' : 'Б/У'}`, value: car.condition }
            ]
        },
        {
            type: 'number',
            name: 'price',
            message: `Цена ($${car.price}):`,
            filter: (input: number) => (input && !isNaN(input) ? input : car.price)
        }
    ]);

    carService.updateCar(carId, {
        manufacturer: answers.manufacturer,
        model: answers.model,
        year: answers.year,
        condition: answers.condition,
        price: answers.price
    });

    await showMainMenu();
}

async function deleteCar(): Promise<void> {
    const cars = carService.getAllCars();

    if (cars.length === 0) {
        console.log('\nКаталог пуст. Сначала добавьте автомобили.');
        await showMainMenu();
        return;
    }

    const { carId }: CarIdAnswers = await inquirer.prompt([
        {
            type: 'list',
            name: 'carId',
            message: 'Выберите автомобиль для удаления:',
            choices: cars.map(car => ({
                name: `ID: ${car.id} - ${car.manufacturer} ${car.model} ($${car.price.toLocaleString()})`,
                value: car.id
            })),
            pageSize: 10
        }
    ]);

    const { confirm }: ConfirmAnswers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Вы уверены, что хотите удалить этот автомобиль?',
            default: false
        }
    ]);

    if (confirm) {
        carService.deleteCar(carId);
    } else {
        console.log('Удаление отменено');
    }

    await showMainMenu();
}

async function main(): Promise<void> {
    console.log('Добро пожаловать в систему управления автосалоном!' + '\n');

    await showMainMenu();
}

main().catch((error) => {
    console.error('Произошла ошибка:', error);
    process.exit(1);
});