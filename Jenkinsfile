pipeline {
    agent any
        tools {
            nodejs 'node-2490'
        }
    environment {
        // Load the Mongo URI from Jenkins credentials
        MONGO_URI = credentials('MONGO_URI')
        IMAGE_TAG = "v${BUILD_NUMBER}"
        SONAR_TOKEN = credentials('sonarcloud-token')
        SONARQUBE = 'SonarCloud'
    }
    stages {
        stage('Installing Dependencies')
        {
            steps {
                sh 'npm install'
            }
        }
        stage('Dependency Fix')
        {
            parallel {
                stage('NPM Dependency Audit')
                {
                        steps {
                                sh '''
                                    npm audit --audit-level=critical
                                    echo $?
                                '''
                        }
                }
                stage('OWASP Dependency Check') {
                            steps {
                                dependencyCheck additionalArguments: '''
                                    --scan ./
                                    --out ./
                                    --format ALL
                                    --disableYarnAudit
                                    --prettyPrint''', odcInstallation: 'OWASP-12-1-6'

                                dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: false
                            }
                }
            }
        }
        stage('NPM test')
        {
            steps {
                sh 'npm test -- --coverage'
            }
        }
        stage('Code Coverage') {
            steps {
                catchError(buildResult: 'SUCCESS', message: 'Oops! it will be fixed in future releases', stageResult: 'UNSTABLE') {
                    sh 'npm run coverage'
                }
            }
        }
        stage('SonarCloud Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE}") {
                    withCredentials([string(credentialsId: 'sonarcloud-token', variable: 'SONAR_TOKEN')]) {
                        sh """
                        ${tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'}/bin/sonar-scanner \
                          -Dsonar.organization=manjushabhopale \
                          -Dsonar.projectKey=manjushabhopale_solar-system-manual \
                          -Dsonar.sources=. \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                          -Dsonar.host.url=https://sonarcloud.io \
                          -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Docker Build')
        {
            steps {
                sh 'docker build -t dev/solar-system:${IMAGE_TAG} . '
            }
        }
        stage('Trivy Scan')
        {
            steps {
                sh  '''
                    trivy image dev/solar-system:${IMAGE_TAG} \
                        --severity LOW,MEDIUM,HIGH \
                        --exit-code 0 \
                        --quiet \
                        --format json -o trivy-image-MEDIUM-results.json

                    trivy image dev/solar-system:${IMAGE_TAG} \
                        --severity CRITICAL \
                        --exit-code 1 \
                        --quiet \
                        --format json -o trivy-image-CRITICAL-results.json
                '''
            }
        }
        stage('aws login')
        {
            steps {
                withAWS(credentials: 'aws-creds', region: 'ap-south-1') {
                    sh 'aws s3 ls'
                }
            }
        }
        stage('LOgin to ECR')
        {
            steps {
                withAWS(credentials: 'aws-creds', region: 'ap-south-1') {
                    script {
                        sh '''
                        aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 307946649652.dkr.ecr.ap-south-1.amazonaws.com
                        docker tag dev/solar-system:${IMAGE_TAG} 307946649652.dkr.ecr.ap-south-1.amazonaws.com/dev/solar-system:${IMAGE_TAG}
                        docker push 307946649652.dkr.ecr.ap-south-1.amazonaws.com/dev/solar-system:${IMAGE_TAG}
                        '''
                    }
                }
            }
        }
        stage('K8S - Update Image Tag') {
            steps {
                withCredentials([string(credentialsId: 'github-creds', variable: 'GIT_TOKEN')]) {
                 sh 'rm -rf solar-system-k8s'
                sh 'git clone -b main https://github.com/manjushabhopale/solar-system-k8s.git'
                dir("solar-system-k8s") {
                    sh '''
                        #### Replace Docker Tag ####
                        git checkout main
                        sed -i "s#dev/solar-system.*#dev/solar-system:${IMAGE_TAG}#g" deployment.yaml
                        cat deployment.yaml
                        
                        #### Commit and Push to Feature Branch ####
                        git config --global user.email "manjushabhopale95.com"
                        git remote set-url origin https://${GIT_TOKEN}@github.com/manjushabhopale/solar-system-k8s.git
                        git add .
                        git commit -am "Updated docker image"
                        git push -u origin main
                    '''
                }
                }
            }
        }
    }
    post {
        always {
            //junit 'coverage/**/*.xml' // Optional: to visualize test results in Jenkins
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code Coverage HTML Report', reportTitles: '', useWrapperFileDirectly: true])
        }
    }
}

