using Microsoft.ML;
using Microsoft.ML.Data;
using Microsoft.ML.Trainers;
using Project3.Data;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;

namespace Project3
{
    class Program
    {
        private static string BaseModelRelativePath = @"../../../../Model";
        private static string ModelRelativePath = $"{BaseModelRelativePath}/MovieRecommenderModel.zip";
        static void Main(string[] args)
        {
            MLContext mlContext = new MLContext();
            IDataView dataView = LoadData(mlContext);
            Console.WriteLine("-----------------------Data from database-------------------------");
            GetDataInsights(dataView, mlContext);

            (IDataView trainingDataView, IDataView testDataView) = PrepareData(dataView, mlContext);
            Console.WriteLine("-----------------------Training data------------------------------");
            GetDataInsights(trainingDataView, mlContext);
            Console.WriteLine("-----------------------Test data----------------------------------");
            GetDataInsights(testDataView, mlContext);
            ITransformer model = BuildAndTrainModel(mlContext, trainingDataView);
            Console.WriteLine("\n-----------------------Evaluate Model----------------------------------");
            EvaluateModel(mlContext, testDataView, model);
            Console.WriteLine("\n-----------------------Making a prediction----------------------------------");
            UseModelForSinglePrediction(mlContext, model);
            Console.WriteLine("\n-----------------------Improve model----------------------------------");
            ITransformer improvedModel = ImproveModel(mlContext, dataView);
            UseModelForSinglePrediction(mlContext, model);
            Console.WriteLine("\n--------------------Saving the model to a file ----------------------");
            SaveModel(mlContext, trainingDataView.Schema, improvedModel);
        }
        public static IDataView LoadData(MLContext mlContext)
        {
            DatabaseLoader loader = mlContext.Data.CreateDatabaseLoader<MovieRating>();
            string connectionString = @"Data Source=(Local);Database=MovieReviews;Integrated Security=True;Connect Timeout=30";
            string sqlCommand = "SELECT AccountId as userId, MovieId as movieId, CAST(Ratings as REAL) as Label FROM dbo.Reviews";
            DatabaseSource dbSource = new DatabaseSource(SqlClientFactory.Instance, connectionString, sqlCommand);
            return loader.Load(dbSource);
        }
        public static void GetDataInsights(IDataView data, MLContext mlContext)
        {
            var enumdata = mlContext.Data.CreateEnumerable<MovieRating>(data, reuseRowObject: false).ToList();
            Console.WriteLine($"The dataset has {enumdata.ToList().Count} rows. First 4 rows in the dataset: \nuserId, movieId, rating");
            for (int i = 0; i < 4; i++)
                Console.WriteLine($"{enumdata[i].userId}, {enumdata[i].movieId}, {enumdata[i].Label}");
            var users = enumdata.GroupBy(m => m.userId).Select(m => m.Key).ToList();
            int min = int.MaxValue;
            foreach (int id in users)
            {
                int count = enumdata.Where(m => m.userId == id).ToList().Count;
                if (count < min) min = count;
            }
            Console.WriteLine($"There are {users.Count} users, every users rated at least {min} movies\n");
        }
        public static (IDataView training, IDataView test) PrepareData (IDataView data, MLContext mlContext)
        {
            var split = mlContext.Data.TrainTestSplit(data, testFraction: 0.1, samplingKeyColumnName: null);
            return (split.TrainSet, split.TestSet);
        }
        
        public static ITransformer BuildAndTrainModel(MLContext mlContext, IDataView trainingDataView)
        {
            IEstimator<ITransformer> estimator = mlContext.Transforms.Conversion.MapValueToKey(outputColumnName: "userIdEncoded", inputColumnName: "userId")
            .Append(mlContext.Transforms.Conversion.MapValueToKey(outputColumnName: "movieIdEncoded", inputColumnName: "movieId"));

            var options = new MatrixFactorizationTrainer.Options
            {
                MatrixColumnIndexColumnName = "userIdEncoded",
                MatrixRowIndexColumnName = "movieIdEncoded",
                LabelColumnName = "Label",
                NumberOfIterations = 20,
                ApproximationRank = 100
            };

            var trainerEstimator = estimator.Append(mlContext.Recommendation().Trainers.MatrixFactorization(options));

            Console.WriteLine("-----------------------Training the model------------------------------");
            ITransformer model = trainerEstimator.Fit(trainingDataView);

            return model;
        }
        public static void EvaluateModel(MLContext mlContext, IDataView testDataView, ITransformer model)
        {
            var prediction = model.Transform(testDataView);    // đầu vào là data gồm 5 cột: userId, movieId, label, userIdEncoded và movieIdEncoded, output: 5 cột + Score
            var metrics = mlContext.Regression.Evaluate(prediction, labelColumnName: "Label", scoreColumnName: "Score");
            Console.WriteLine("Root Mean Squared Error: " + metrics.RootMeanSquaredError.ToString());
            Console.WriteLine("RSquared: " + metrics.RSquared.ToString());
        }
        public static void UseModelForSinglePrediction(MLContext mlContext, ITransformer model)
        {
            var predictionEngine = mlContext.Model.CreatePredictionEngine<MovieRating, MovieRatingPrediction>(model);
            var testInput = new MovieRating { userId = 17, movieId = 10191 };
            var movieRatingPrediction = predictionEngine.Predict(testInput);
            Console.WriteLine($"User: {testInput.userId} is predicted to rate movie {testInput.movieId} {movieRatingPrediction.Score} stars");
            if (Math.Round(movieRatingPrediction.Score, 1) > 7)
                Console.WriteLine("Therefore, movie " + testInput.movieId + " is recommended for user " + testInput.userId);
            else Console.WriteLine("Therefore, movie " + testInput.movieId + " is not recommended for user " + testInput.userId);
        }
        public static ITransformer ImproveModel(MLContext mlContext, IDataView trainingDataView)
        {
            // Tạo pipeline
            IEstimator<ITransformer> estimator = mlContext.Transforms.Conversion.MapValueToKey(outputColumnName: "userIdEncoded", inputColumnName: "userId")
            .Append(mlContext.Transforms.Conversion.MapValueToKey(outputColumnName: "movieIdEncoded", inputColumnName: "movieId"));

            var options = new MatrixFactorizationTrainer.Options
            {
                MatrixColumnIndexColumnName = "userIdEncoded",
                MatrixRowIndexColumnName = "movieIdEncoded",
                LabelColumnName = "Label",
                NumberOfIterations = 20,
                ApproximationRank = 100
            };

            var trainerEstimator = estimator.Append(mlContext.Recommendation().Trainers.MatrixFactorization(options));
            // Chạy Cross Validation
            var cvResults = mlContext.Regression.CrossValidate(trainingDataView, trainerEstimator, numberOfFolds: 5);
            // Kết quả
            Console.WriteLine("\nRMSE and R2 of 5 Cross Validation");
            foreach (var fold in cvResults)
                Console.WriteLine($"RMSE: {fold.Metrics.RootMeanSquaredError}, R2: {fold.Metrics.RSquared}");
            // Lấy model tốt nhất
            var bestFold = cvResults.OrderByDescending(fold => fold.Metrics.RSquared).FirstOrDefault();     
            Console.WriteLine($"\nThe best model is the model with RMSE: {bestFold.Metrics.RootMeanSquaredError}, R2: {bestFold.Metrics.RSquared}");
            return bestFold.Model;
        }
        public static void SaveModel(MLContext mlContext, DataViewSchema trainingDataViewSchema, ITransformer model)
        {
            var modelPath = GetAbsolutePath(ModelRelativePath);
            mlContext.Model.Save(model, trainingDataViewSchema, modelPath);
        }
        public static string GetAbsolutePath(string relativeDatasetPath)
        {
            FileInfo _dataRoot = new FileInfo(typeof(Program).Assembly.Location);
            string assemblyFolderPath = _dataRoot.Directory.FullName;

            string fullPath = Path.Combine(assemblyFolderPath, relativeDatasetPath);

            return fullPath;
        }
    }
}
