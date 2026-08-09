import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
import os

# Score ranges per essay set (min, max)
SCORE_RANGES = {
    1: (2, 12), 2: (1, 6), 3: (0, 3), 4: (0, 3),
    5: (0, 4), 6: (0, 4), 7: (0, 30), 8: (0, 60)
}

def normalize_score(score, essay_set):
    min_s, max_s = SCORE_RANGES[essay_set]
    return (score - min_s) / (max_s - min_s) * 100

# Load data
print("Loading dataset...")
df = pd.read_csv('assets/training_set_rel3.tsv', sep='\t', encoding='latin-1')
df = df[['essay_set', 'essay', 'domain1_score']].dropna()
df['essay'] = df['essay'].astype(str)
df['normalized_score'] = df.apply(
    lambda row: normalize_score(row['domain1_score'], row['essay_set']), axis=1
)

print(f"Total essays: {len(df)}")
print(f"Score distribution:\n{df['normalized_score'].describe()}")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    df['essay'], df['normalized_score'], test_size=0.2, random_state=42
)

# TF-IDF vectorizer
print("Fitting TF-IDF vectorizer...")
vectorizer = TfidfVectorizer(
    max_features=10000,
    ngram_range=(1, 2),
    sublinear_tf=True,
    strip_accents='unicode',
    analyzer='word',
    min_df=2
)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# Train Ridge regression
print("Training Ridge regression model...")
model = Ridge(alpha=1.0)
model.fit(X_train_tfidf, y_train)

# Evaluate
y_pred = model.predict(X_test_tfidf)
y_pred_clipped = np.clip(y_pred, 0, 100)
rmse = np.sqrt(mean_squared_error(y_test, y_pred_clipped))
print(f"Test RMSE: {rmse:.2f}")
print(f"Prediction range: {y_pred_clipped.min():.1f} – {y_pred_clipped.max():.1f}")

# Save model
os.makedirs('ml', exist_ok=True)
joblib.dump(model, 'ml/scorer_model.joblib')
joblib.dump(vectorizer, 'ml/scorer_vectorizer.joblib')
print("Model saved to ml/scorer_model.joblib")
print("Vectorizer saved to ml/scorer_vectorizer.joblib")