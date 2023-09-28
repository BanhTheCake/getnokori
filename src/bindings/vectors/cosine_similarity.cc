#include <iostream>
#include <vector>
#include <cmath>
#include <napi.h>

std::vector<double> NapiArrayToVector(const Napi::Value& value) {
    Napi::Array array = value.As<Napi::Array>();
    std::vector<double> result(array.Length());

    for (size_t i = 0; i < array.Length(); ++i) {
        result[i] = array.Get(i).As<Napi::Number>().DoubleValue();
    }

    return result;
}

std::vector<std::vector<double>> NapiArrayOfArraysToVectorOfVectors(const Napi::Value& value) {
    Napi::Array outer_array = value.As<Napi::Array>();
    std::vector<std::vector<double>> result(outer_array.Length());

    for (size_t i = 0; i < outer_array.Length(); ++i) {
        result[i] = NapiArrayToVector(outer_array.Get(i));
    }

    return result;
}

// Function to compute the dot product of two vectors
double dot_product(const std::vector<double>& vec1, const std::vector<double>& vec2) {
    double result = 0.0;

    for (size_t i = 0; i < vec1.size(); ++i) {
        result += vec1[i] * vec2[i];
    }

    return result;
}

// Function to compute the magnitude of a vector
double magnitude(const std::vector<double>& vec) {
    double result = 0.0;

    for (const double& value : vec) {
        result += value * value;
    }

    return std::sqrt(result);
}

// Function to compute the cosine similarity of two vectors
double CosineSimilarity(const std::vector<double>& vec1, const std::vector<double>& vec2) {
    if (vec1.size() != vec2.size()) {
        std::cerr << "Vectors must have the same size!" << std::endl;
        return 0.0;
    }

    double dotProduct = dot_product(vec1, vec2);
    double magnitudeVec1 = magnitude(vec1);
    double magnitudeVec2 = magnitude(vec2);

    return dotProduct / (magnitudeVec1 * magnitudeVec2);
}

Napi::Number CosineSimilarityWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 2 || !info[0].IsArray() || !info[1].IsArray()) {
        Napi::TypeError::New(env, "Expected two arrays as arguments").ThrowAsJavaScriptException();
        return Napi::Number::New(env, 0);
    }

    Napi::Array vec1 = info[0].As<Napi::Array>();
    Napi::Array vec2 = info[1].As<Napi::Array>();

    std::vector<double> vector1(vec1.Length());
    std::vector<double> vector2(vec2.Length());

    if (vector1.size() != vector2.size()) {
        Napi::TypeError::New(env, "Vectors must have the same size!").ThrowAsJavaScriptException();
        return Napi::Number::New(env, 0);
    }

    for (uint32_t i = 0; i < vec1.Length(); ++i) {
        vector1[i] = vec1.Get(i).As<Napi::Number>().DoubleValue();
    }

    for (uint32_t i = 0; i < vec2.Length(); ++i) {
        vector2[i] = vec2.Get(i).As<Napi::Number>().DoubleValue();
    }

    double result = CosineSimilarity(vector1, vector2);
    return Napi::Number::New(env, result);
}

std::pair<size_t, double> FindClosestVector(const std::vector<double>& target, const std::vector<std::vector<double>>& vectors) {
    size_t closest_index = 0;
    double max_similarity = -1;

    for (size_t i = 0; i < vectors.size(); ++i) {
        double similarity = CosineSimilarity(target, vectors[i]);
        if (similarity > max_similarity) {
            max_similarity = similarity;
            closest_index = i;
        }
    }

    return std::make_pair(closest_index, max_similarity);
}

Napi::Object FindClosestVectorWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 2 || !info[0].IsArray() || !info[1].IsArray()) {
        Napi::TypeError::New(env, "Expected a vector and an array of vectors as arguments").ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }

    std::vector<double> target = NapiArrayToVector(info[0]);
    std::vector<std::vector<double>> vectors = NapiArrayOfArraysToVectorOfVectors(info[1]);

    std::pair<size_t, double> result = FindClosestVector(target, vectors);

    Napi::Object output = Napi::Object::New(env);
    output.Set("index", Napi::Number::New(env, result.first));
    output.Set("score", Napi::Number::New(env, result.second));

    return output;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("cosineSimilarity", Napi::Function::New(env, CosineSimilarityWrapped));
    exports.Set("findClosestVector", Napi::Function::New(env, FindClosestVectorWrapped));
    return exports;
}

NODE_API_MODULE(cosine_similarity, Init)
