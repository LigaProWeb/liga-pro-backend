import { Test, TestingModule } from '@nestjs/testing';
import { NOTIFICATIONS_SERVICE } from '@app/contracts';
import { of } from 'rxjs';
import { MatchesServiceController } from './matches-service.controller';
import { MatchesServiceService } from './matches-service.service';

//TEST UNITARIOS: pruebas para lógica de negocio y controladores, con dependencias simuladas
describe('MatchesServiceController', () => {
  let matchesServiceController: MatchesServiceController;

  //CONFIGURACIÓN DE PRUEBAS: creación de módulo de pruebas con controladores y servicios, simulando dependencias
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MatchesServiceController],
      providers: [
        MatchesServiceService,
        {
          provide: NOTIFICATIONS_SERVICE,
          useValue: {
            emit: jest.fn(() => of(true)),
          },
        },
      ],
    }).compile();

    matchesServiceController = app.get<MatchesServiceController>(
      MatchesServiceController,
    );
  });

  //PRUEBAS: pruebas para cada método del controlador, verificando comportamiento esperado
  describe('root', () => {
    it('should start with no matches', () => {
      expect(matchesServiceController.findAll()).toEqual([]);
    });
  });
});
