class toothbrush { 
    static #total = 0;
    #brand;
    #bristles;
    constructor(brand, bristles) {
        this.#brand = brand;
        this.#bristles = bristles
        Toothebrush.#total++;
    }
    [Symbol.toPrimitive]() {
        return 'Brand: ${this.#brand}, Bristles: ${this.#bristles}'
    }
    set bristles(bristles){
        this.#bristles = bristles 
    }
    get bristles(){
        return this.#brand
    }
    static getTotal() {
        return Toothebrush.#total ``
    }
}

class ElectricToothbrush extends Toothebrush { 
    #watts;
    constructor(brand, bristles, watts) {
        super(brand, bristles)
        this.#watts = watts
    }
    [Symbol.toPrimitive]() {
        super.
    }
}

