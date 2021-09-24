// Simulation configuration
const individualSize = 50; // Number of genes in each individual
const populationSize = 500; // Number of individuals in the population (remains constant throughout)
const iterations = 100; // Number of times to evolve the population
const graphHeight = 15; // Height of the average fitness graph in the console - set to `null` to disable

// NN configuration
const keepFraction = 0.1; // Fraction of each population to keep (rest is discarded)
const mutateFraction = 0.9; // Fraction of each population to create from the remaining population via crossover
// Any remaining gap in the population is filled by random individuals
// e.g. KF=0.2 MF=0.7 - 20% of the population will be kept and used to generate another 70% of the population via
// crossover, leaving a gap of 10% which is generated randomly

// ——————————————————————————————————————————————————————————————————————————————————————————————————————————————

const { NeuralNetwork } = require("./NeuralNetwork");
const asciichart = require("./asciichart");

const startingIndividuals = Array(populationSize)
  .fill()
  .map(() =>
    Array(individualSize)
      .fill()
      .map((x) => Math.round(Math.random()))
  );

const net = new NeuralNetwork({
  target: Array(individualSize).fill(1),
  population: startingIndividuals,
  keepFraction: keepFraction,
  mutateFraction: mutateFraction,
  haltRange: 0.001,
  haltHistory: 20
});

let fitnessLevels = [];

while (net.changing) {
  fitnessLevels.push(net.averageFitness / individualSize);
  net.evolve();
}

if (graphHeight)
  console.log(asciichart.plot(fitnessLevels, { height: graphHeight }));
