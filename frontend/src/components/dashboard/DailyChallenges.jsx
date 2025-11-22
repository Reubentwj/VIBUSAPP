import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle, Circle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/api/client'

export default function DailyChallenges({ challenges, userEmail }) {
  const { data: userChallenges } = useQuery({
    queryKey: ['userChallenges', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return await client.entities.UserChallenge.filter({ user_email: userEmail });
    },
    enabled: !!userEmail,
    initialData: []
  });

  const isChallengeCompleted = (challengeId) => {
    return userChallenges.some(uc => uc.challenge_id === challengeId && uc.completed);
  };

  const completedCount = challenges.filter(c => isChallengeCompleted(c.id)).length;

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Daily Challenges
          </CardTitle>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            {completedCount}/{challenges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {challenges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No challenges today</p>
              <p className="text-sm">Check back tomorrow!</p>
            </div>
          ) : (
            challenges.map((challenge) => {
              const completed = isChallengeCompleted(challenge.id);
              return (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${completed ? 'text-green-900' : 'text-gray-900'}`}>
                        {challenge.title}
                      </p>
                      <p className={`text-sm ${completed ? 'text-green-700' : 'text-gray-600'}`}>
                        {challenge.description}
                      </p>
                    </div>
                    <Badge className={completed ? 'bg-green-600' : 'bg-blue-600'}>
                      +{challenge.points}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}