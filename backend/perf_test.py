import time
import asyncio
import orchestrator

text = """Social media has transformed the way people communicate and interact with one another. Platforms such as Facebook, Instagram, and Twitter have become integral parts of daily life for billions of users worldwide. However, the impact of social media on mental health has become a growing concern among researchers and healthcare professionals.

Studies show that excessive social media use is linked to increased rates of anxiety and depression, particularly among teenagers and young adults. According to research published in medical journals, users who spend more than three hours per day on social media platforms are significantly more likely to report feelings of loneliness and inadequacy. The constant exposure to carefully curated images and highlight reels of others lives can lead to unhealthy social comparisons.

I argue that social media companies have a responsibility to address these mental health concerns. Evidence shows that features such as infinite scrolling and notification systems are deliberately designed to maximize engagement at the expense of user wellbeing. Therefore, regulatory intervention may be necessary to protect vulnerable users.

Although critics argue that social media also provides significant benefits such as community building and access to support networks, the negative effects on mental health cannot be ignored. On the other hand, when used mindfully and in moderation, social media can be a positive force in peoples lives.

In conclusion, the relationship between social media and mental health is complex and multifaceted. Furthermore, more research is needed to fully understand the long-term effects of social media use on psychological wellbeing. Consequently, both individuals and policymakers must work together to ensure that social media serves as a tool for connection rather than a source of harm."""

rubric = {
    'id': 'test',
    'version': '1',
    'prompt': 'Discuss the impact of social media on mental health',
    'gradeBands': {'A': 85, 'B': 70, 'C': 55, 'D': 40},
    'categories': [
        {'id': 'cat_grammar', 'weight': 17},
        {'id': 'cat_clarity', 'weight': 17},
        {'id': 'cat_vocabulary', 'weight': 17},
        {'id': 'cat_relevance', 'weight': 17},
        {'id': 'cat_organization', 'weight': 16},
        {'id': 'cat_argument', 'weight': 16},
    ]
}

start = time.time()
result = asyncio.run(orchestrator.evaluate(text, rubric))
elapsed = time.time() - start

print(f'Time: {elapsed:.2f}s')
print(f'Overall: {result["overallScore"]} ({result["letterGrade"]})')
for cat in result['categoryScores']:
    print(f'  {cat["categoryId"]}: {cat["score"]}')