pipeline {
    agent any
        tools {
            nodejs 'node-2490'
        }
    environment {
        // Load the Mongo URI from Jenkins credentials
        MONGO_URI = credentials('MONGO_URI')
    }
    stages {
        stage('Installing Dependencies')
        {
            steps {
                sh 'npm install --no-audit'
            }
        }
        stage('NPM Dependency Audit')
         {
                steps {
                        sh '''
                            npm audit --audit-level=critical
                            echo $?
                        '''
                    }
            }
 /*       stage('NPM test')
        {
            steps {
                sh 'npm test'
            }
        }
        stage('Docker Build')
        {
            steps {
                sh '''
                docker build -t solar-system .
                '''
            }
        }
        stage('Docker run')
        {
            steps {
                sh '''
                docker run -d --name solar-system \
                -p 3000:3000 \
                -e $MONGO_URI \
                solar-system:latest
                '''
            }
        }
        */
    }
}

