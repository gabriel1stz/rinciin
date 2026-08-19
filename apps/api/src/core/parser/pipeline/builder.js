export function buildTransaction(data) {

  return {

    success: true,

    confidence: data.confidence,

    transaction: {

      ...data

    }

  };

}