pipeline {
    agent any
        tools {
            nodejs 'node-2490'
        }
    stages {
        stage('Check Node version')
        {
            steps {
                sh '''
                    node --version
                    npm --version
                    '''
            }
        }
        stage('Installing Dependencies')
        {
            steps {
                sh 'npm install'
            }
        }
        stage('NPM test')
        {
            steps {
                sh 'npm test'
            }
        }
    }
}

