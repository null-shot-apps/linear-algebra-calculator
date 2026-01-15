'use client';

import { useState } from 'react';

export default function LinearAlgebraCalculator() {
  const [darkMode, setDarkMode] = useState(false);
  const [operation, setOperation] = useState('add');
  const [matrixARows, setMatrixARows] = useState(2);
  const [matrixACols, setMatrixACols] = useState(2);
  const [matrixBRows, setMatrixBRows] = useState(2);
  const [matrixBCols, setMatrixBCols] = useState(2);
  const [matrixA, setMatrixA] = useState<number[][]>([[0, 0], [0, 0]]);
  const [matrixB, setMatrixB] = useState<number[][]>([[0, 0], [0, 0]]);
  const [scalar, setScalar] = useState(1);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);

  // Initialize matrix with given dimensions
  const initializeMatrix = (rows: number, cols: number): number[][] => {
    return Array(rows).fill(0).map(() => Array(cols).fill(0));
  };

  // Update matrix dimensions
  const updateMatrixASize = (rows: number, cols: number) => {
    setMatrixARows(rows);
    setMatrixACols(cols);
    setMatrixA(initializeMatrix(rows, cols));
  };

  const updateMatrixBSize = (rows: number, cols: number) => {
    setMatrixBRows(rows);
    setMatrixBCols(cols);
    setMatrixB(initializeMatrix(rows, cols));
  };

  // Update matrix cell value
  const updateMatrixCell = (matrix: 'A' | 'B', row: number, col: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (matrix === 'A') {
      const newMatrix = [...matrixA];
      newMatrix[row][col] = numValue;
      setMatrixA(newMatrix);
    } else {
      const newMatrix = [...matrixB];
      newMatrix[row][col] = numValue;
      setMatrixB(newMatrix);
    }
  };

  // Matrix operations
  const addMatrices = (a: number[][], b: number[][]): number[][] => {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  };

  const subtractMatrices = (a: number[][], b: number[][]): number[][] => {
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
  };

  const multiplyMatrices = (a: number[][], b: number[][]): number[][] => {
    const result = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < a[0].length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  };

  const scalarMultiply = (matrix: number[][], scalar: number): number[][] => {
    return matrix.map(row => row.map(val => val * scalar));
  };

  const transpose = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };

  const determinant = (matrix: number[][]): number => {
    const n = matrix.length;
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    
    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== j));
      det += Math.pow(-1, j) * matrix[0][j] * determinant(minor);
    }
    return det;
  };

  const inverse = (matrix: number[][]): number[][] | null => {
    const n = matrix.length;
    const det = determinant(matrix);
    
    if (Math.abs(det) < 1e-10) return null;
    
    if (n === 2) {
      return [
        [matrix[1][1] / det, -matrix[0][1] / det],
        [-matrix[1][0] / det, matrix[0][0] / det]
      ];
    }
    
    // For larger matrices, use adjugate method
    const adjugate = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const minor = matrix
          .filter((_, rowIndex) => rowIndex !== i)
          .map(row => row.filter((_, colIndex) => colIndex !== j));
        adjugate[j][i] = Math.pow(-1, i + j) * determinant(minor);
      }
    }
    
    return adjugate.map(row => row.map(val => val / det));
  };

  const dotProduct = (a: number[][], b: number[][]): number => {
    const vecA = a.flat();
    const vecB = b.flat();
    return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  };

  const crossProduct = (a: number[][], b: number[][]): number[] => {
    const vecA = a.flat();
    const vecB = b.flat();
    return [
      vecA[1] * vecB[2] - vecA[2] * vecB[1],
      vecA[2] * vecB[0] - vecA[0] * vecB[2],
      vecA[0] * vecB[1] - vecA[1] * vecB[0]
    ];
  };

  const solveLinearSystem = (a: number[][], b: number[][]): number[][] | null => {
    const invA = inverse(a);
    if (!invA) return null;
    return multiplyMatrices(invA, b);
  };

  // Format matrix for display
  const formatMatrix = (matrix: number[][]): string => {
    return matrix.map(row => 
      '[ ' + row.map(val => val.toFixed(2).padStart(8)).join(' ') + ' ]'
    ).join('\n');
  };

  // Calculate result
  const calculate = () => {
    setError('');
    setResult('');
    setSteps([]);
    
    try {
      let resultMatrix: number[][] | null = null;
      let resultValue: number | number[] | null = null;
      const calculationSteps: string[] = [];

      switch (operation) {
        case 'add':
          if (matrixARows !== matrixBRows || matrixACols !== matrixBCols) {
            throw new Error('Matrices must have the same dimensions for addition');
          }
          calculationSteps.push('Step 1: Add corresponding elements');
          resultMatrix = addMatrices(matrixA, matrixB);
          break;

        case 'subtract':
          if (matrixARows !== matrixBRows || matrixACols !== matrixBCols) {
            throw new Error('Matrices must have the same dimensions for subtraction');
          }
          calculationSteps.push('Step 1: Subtract corresponding elements');
          resultMatrix = subtractMatrices(matrixA, matrixB);
          break;

        case 'multiply':
          if (matrixACols !== matrixBRows) {
            throw new Error('Matrix A columns must equal Matrix B rows for multiplication');
          }
          calculationSteps.push('Step 1: Multiply rows of A by columns of B');
          calculationSteps.push(`Step 2: Result will be ${matrixARows}×${matrixBCols} matrix`);
          resultMatrix = multiplyMatrices(matrixA, matrixB);
          break;

        case 'scalar':
          calculationSteps.push(`Step 1: Multiply each element by ${scalar}`);
          resultMatrix = scalarMultiply(matrixA, scalar);
          break;

        case 'transpose':
          calculationSteps.push('Step 1: Swap rows and columns');
          resultMatrix = transpose(matrixA);
          break;

        case 'determinant':
          if (matrixARows !== matrixACols) {
            throw new Error('Matrix must be square to calculate determinant');
          }
          calculationSteps.push('Step 1: Calculate determinant using cofactor expansion');
          resultValue = determinant(matrixA);
          setResult(`Determinant = ${resultValue.toFixed(4)}`);
          break;

        case 'inverse':
          if (matrixARows !== matrixACols) {
            throw new Error('Matrix must be square to calculate inverse');
          }
          calculationSteps.push('Step 1: Calculate determinant');
          const det = determinant(matrixA);
          calculationSteps.push(`Step 2: Determinant = ${det.toFixed(4)}`);
          if (Math.abs(det) < 1e-10) {
            throw new Error('Matrix is singular (determinant = 0), inverse does not exist');
          }
          calculationSteps.push('Step 3: Calculate adjugate matrix');
          calculationSteps.push('Step 4: Divide adjugate by determinant');
          resultMatrix = inverse(matrixA);
          break;

        case 'solve':
          if (matrixARows !== matrixACols) {
            throw new Error('Coefficient matrix must be square');
          }
          if (matrixBRows !== matrixARows || matrixBCols !== 1) {
            throw new Error('Constants matrix must be n×1 where n is the size of coefficient matrix');
          }
          calculationSteps.push('Step 1: Calculate inverse of coefficient matrix');
          calculationSteps.push('Step 2: Multiply inverse by constants vector');
          resultMatrix = solveLinearSystem(matrixA, matrixB);
          if (!resultMatrix) {
            throw new Error('System has no unique solution (matrix is singular)');
          }
          break;

        case 'dot':
          if (matrixARows * matrixACols !== matrixBRows * matrixBCols) {
            throw new Error('Vectors must have the same number of elements');
          }
          calculationSteps.push('Step 1: Multiply corresponding elements and sum');
          resultValue = dotProduct(matrixA, matrixB);
          setResult(`Dot Product = ${resultValue.toFixed(4)}`);
          break;

        case 'cross':
          if ((matrixARows * matrixACols !== 3) || (matrixBRows * matrixBCols !== 3)) {
            throw new Error('Cross product requires 3D vectors (3 elements each)');
          }
          calculationSteps.push('Step 1: Calculate cross product using determinant formula');
          const cross = crossProduct(matrixA, matrixB);
          setResult(`Cross Product = [${cross.map(v => v.toFixed(4)).join(', ')}]`);
          break;
      }

      if (resultMatrix) {
        setResult(formatMatrix(resultMatrix));
      }
      
      setSteps(calculationSteps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Reset all inputs
  const reset = () => {
    setMatrixA(initializeMatrix(matrixARows, matrixACols));
    setMatrixB(initializeMatrix(matrixBRows, matrixBCols));
    setScalar(1);
    setResult('');
    setError('');
    setSteps([]);
  };

  const needsMatrixB = ['add', 'subtract', 'multiply', 'solve', 'dot', 'cross'].includes(operation);
  const needsScalar = operation === 'scalar';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Linear Algebra Calculator</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Operation Selection */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">Select Operation:</label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="add">Matrix Addition</option>
            <option value="subtract">Matrix Subtraction</option>
            <option value="multiply">Matrix Multiplication</option>
            <option value="scalar">Scalar Multiplication</option>
            <option value="transpose">Transpose</option>
            <option value="determinant">Determinant</option>
            <option value="inverse">Matrix Inverse</option>
            <option value="solve">Solve Linear System (Ax = b)</option>
            <option value="dot">Vector Dot Product</option>
            <option value="cross">Vector Cross Product (3D)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Matrix A Input */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-2xl font-semibold mb-4">Matrix A {operation === 'solve' && '(Coefficients)'}</h2>
            
            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1">Rows:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={matrixARows}
                  onChange={(e) => updateMatrixASize(parseInt(e.target.value) || 1, matrixACols)}
                  className={`w-20 p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Columns:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={matrixACols}
                  onChange={(e) => updateMatrixASize(matrixARows, parseInt(e.target.value) || 1)}
                  className={`w-20 p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="border-collapse">
                <tbody>
                  {matrixA.map((row, i) => (
                    <tr key={i}>
                      {row.map((val, j) => (
                        <td key={j} className="p-1">
                          <input
                            type="number"
                            step="0.01"
                            value={val}
                            onChange={(e) => updateMatrixCell('A', i, j, e.target.value)}
                            className={`w-20 p-2 rounded border text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matrix B Input */}
          {needsMatrixB && (
            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-2xl font-semibold mb-4">Matrix B {operation === 'solve' && '(Constants)'}</h2>
              
              <div className="flex gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-1">Rows:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={matrixBRows}
                    onChange={(e) => updateMatrixBSize(parseInt(e.target.value) || 1, matrixBCols)}
                    className={`w-20 p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Columns:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={matrixBCols}
                    onChange={(e) => updateMatrixBSize(matrixBRows, parseInt(e.target.value) || 1)}
                    className={`w-20 p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="border-collapse">
                  <tbody>
                    {matrixB.map((row, i) => (
                      <tr key={i}>
                        {row.map((val, j) => (
                          <td key={j} className="p-1">
                            <input
                              type="number"
                              step="0.01"
                              value={val}
                              onChange={(e) => updateMatrixCell('B', i, j, e.target.value)}
                              className={`w-20 p-2 rounded border text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Scalar Input */}
          {needsScalar && (
            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-2xl font-semibold mb-4">Scalar Value</h2>
              <input
                type="number"
                step="0.01"
                value={scalar}
                onChange={(e) => setScalar(parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded border text-center text-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={calculate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Calculate
          </button>
          <button
            onClick={reset}
            className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
          >
            Reset
          </button>
          <button
            onClick={() => setShowSteps(!showSteps)}
            className={`px-6 py-3 rounded-lg font-semibold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
          >
            {showSteps ? 'Hide' : 'Show'} Steps
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Steps Display */}
        {showSteps && steps.length > 0 && (
          <div className={`mb-6 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-xl font-semibold mb-3">Solution Steps:</h3>
            <ol className="list-decimal list-inside space-y-2">
              {steps.map((step, index) => (
                <li key={index} className="text-sm">{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-2xl font-semibold mb-4">Result:</h3>
            <pre className={`p-4 rounded ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} overflow-x-auto font-mono text-sm`}>
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

