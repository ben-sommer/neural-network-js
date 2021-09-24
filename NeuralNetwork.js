const NeuralNetwork = class {
  constructor({ target, population, keepFraction, mutateFraction, haltRange, haltHistory }) {
    if (population.length == 0) {
      throw new Error("Population must have individuals");
    }
    if (
      !population.every(
        (individual) => individual.length == population[0].length
      )
    ) {
      throw new Error("Population must have equally sized individuals");
    }
    this._population = population || [];

    if (target.length == 0) {
      throw new Error("Target must have genes");
    }
    this._target = target || [];

    if (keepFraction + mutateFraction > 1) {
      throw new Error("Invalid fraction values");
    }
    this._keepFraction = keepFraction || 0;
    this._mutateFraction = mutateFraction || 0;

    this._changing = [];
    this._haltRange = haltRange;
    this._haltHistory = haltHistory;
  }

  evolve() {
    const numToKeep = this._getNumToKeep(this._population.length);

    const numToMutate = this._getNumToMutate(this._population.length);

    const fitIndividuals = this._selectFitIndividuals({
      population: this._population,
      count: numToKeep,
      target: this._target,
    });

    const crosses = this._generateCrossOvers({
      population: fitIndividuals,
      count: numToMutate,
    });

    const randoms = this._generateRandomIndividuals({
      count: this.populationSize - numToKeep - numToMutate,
      length: this.individualSize,
    });

    const newPopulation = [...fitIndividuals, ...crosses, ...randoms];

    this._population = newPopulation;

    const averageFitness = this.averageFitness;

    this._addToChanging(averageFitness / this.individualSize);
  }

  get averageFitness() {
    const averageFitness = this._calculateFitnessPopulation({
      population: this._population,
      target: this._target,
    });

    return averageFitness;
  }

  get populationSize() {
    const populationSize = this._population.length;

    return populationSize;
  }

  get individualSize() {
    const individualSize = this._population[0].length;

    return individualSize;
  }

  get population() {
    return this._population;
  }

  get changing() {
    if (this._changing.length != this._haltHistory) return true;
    const range =
      Number(Math.max(...this._changing) - Math.min(...this._changing)) || 0;
    const changing = range > this._haltRange;
    return changing;
  }

  _calculateFitnessIndividual({ individual, target }) {
    if (individual.length != target.length) return 0;

    const fitness =
      individual.reduce((prev, current, index) => {
        if (current == target[index]) return (prev || 0) + 1;

        return prev;
      }) || 0;

    return fitness;
  }

  _calculateFitnessPopulation({ population, target }) {
    const averageFitness =
      population
        .map((individual) =>
          this._calculateFitnessIndividual({
            individual,
            target,
          })
        )
        .reduce((a, b) => a + b) / population.length;

    return averageFitness;
  }

  _selectFitIndividuals({ population, count, target }) {
    const fitnessLevels = population
      .map((individual) =>
        this._calculateFitnessIndividual({
          individual,
          target,
        })
      )
      .map((fitness, index) => ({
        genes: population[index],
        fitness,
      }))
      .sort((a, b) => b.fitness - a.fitness)
      .map((individual) => individual.genes);

    const fitIndividuals = fitnessLevels.slice(0, count);

    return fitIndividuals;
  }

  _crossover({ individualA, individualB }) {
    if (individualA.length != individualB.length)
      return {
        individualA,
        individualB,
      };

    const crossoverPoint = Math.floor(Math.random() * individualA.length);

    const newA = [
      ...individualA.slice(0, crossoverPoint),
      ...individualB.slice(crossoverPoint),
    ];

    const newB = [
      ...individualB.slice(0, crossoverPoint),
      ...individualA.slice(crossoverPoint),
    ];

    return {
      newA,
      newB,
    };
  }

  _generateCrossOver(population) {
    const a = population[Math.floor(Math.random() * population.length)];
    const b = population[Math.floor(Math.random() * population.length)];

    const cross = this._crossover({
      individualA: a,
      individualB: b,
    });

    return cross.newA;
  }

  _generateCrossOvers({ population, count }) {
    const crosses = Array(count)
      .fill()
      .map(() => this._generateCrossOver(population));

    return crosses;
  }

  _generateRandomIndividual(length) {
    const individual = Array(length)
      .fill()
      .map((x) => Math.round(Math.random()));

    return individual;
  }

  _generateRandomIndividuals({ length, count }) {
    const randoms = Array(count)
      .fill()
      .map(() => this._generateRandomIndividual(length));

    return randoms;
  }

  _getNumToKeep(size) {
    const toKeep = Math.floor(size * this._keepFraction);

    return toKeep;
  }

  _getNumToMutate(size) {
    const toMutate = Math.floor(size * this._mutateFraction);

    return toMutate;
  }

  _addToChanging(num) {
    this._changing.push(num);
    if (this._changing.length > this._haltHistory) this._changing.shift();
  }
};

module.exports = {
  NeuralNetwork,
};
