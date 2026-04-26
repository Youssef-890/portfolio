package com.portfolio.calculator;

/**
 * Model class responsible for storing values and performing
 * the core arithmetic calculations of the calculator.
 *
 * This class is UI-agnostic and can be reused by other views.
 */
public class CalculatorModel {

    /**
     * Accumulator where ongoing calculation results are stored.
     */
    private double accumulator = 0.0;

    /**
     * The last operator that was selected (+, -, *, / etc.).
     * It is stored as an enum to make it easy to extend with
     * more operations in the future.
     */
    private Operator pendingOperator = Operator.NONE;

    /**
     * Enum describing the supported operations. New operations
     * (e.g., SIN, COS, POWER) can be added here later.
     */
    public enum Operator {
        ADD, SUBTRACT, MULTIPLY, DIVIDE, NONE
    }

    /**
     * Resets the model to its initial state.
     */
    public void clear() {
        accumulator = 0.0;
        pendingOperator = Operator.NONE;
    }

    /**
     * Sets the first operand for a new calculation sequence.
     *
     * @param value initial value (typically the number currently on the display)
     */
    public void setAccumulator(double value) {
        this.accumulator = value;
    }

    /**
     * Returns the value currently stored in the accumulator.
     */
    public double getAccumulator() {
        return accumulator;
    }

    /**
     * Sets the operator that should be applied the next time
     * a calculation is requested.
     *
     * @param operator operator chosen by the user
     */
    public void setPendingOperator(Operator operator) {
        this.pendingOperator = operator;
    }

    /**
     * Returns the currently pending operator.
     */
    public Operator getPendingOperator() {
        return pendingOperator;
    }

    /**
     * Applies the pending operator to the accumulator and the given value.
     * This method is used for chained operations like 2 + 3 * 4.
     *
     * @param value the second operand, typically the value currently shown on the display
     * @return the result of applying the pending operator
     * @throws ArithmeticException when attempting to divide by zero
     */
    public double applyPendingOperation(double value) {
        switch (pendingOperator) {
            case ADD -> accumulator = accumulator + value;
            case SUBTRACT -> accumulator = accumulator - value;
            case MULTIPLY -> accumulator = accumulator * value;
            case DIVIDE -> {
                if (value == 0.0) {
                    throw new ArithmeticException("Division by zero");
                }
                accumulator = accumulator / value;
            }
            case NONE -> {
                // When there is no pending operator, just move the value into the accumulator.
                accumulator = value;
            }
        }
        return accumulator;
    }
}

